import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useIsMobile } from '@kne/responsive-utils';
import { useState, useRef } from 'react';
import { Select, Segmented, Tag, Tooltip } from 'antd';
import { ReloadOutlined, BarChartOutlined } from '@ant-design/icons';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import {
  PALETTE,
  RANGE_OPTIONS,
  STATUS_COLOR_MAP,
  TASK_TYPE_COLOR_MAP,
  tooltipStyle,
  lineTooltipStyle,
  legendCenterStyle,
  lineChartGrid,
  lineSmooth,
  axisLineStyle,
  axisLabelStyle,
  splitLineStyle,
  roundStackedBarTops,
  formatDuration,
  pickMetricState
} from './constants';
import {
  COMPLETED_STATUS_LIST,
  resolveBuckets,
  formatBucketAxisLabel,
  formatBucketTitle,
  formatRangeCaption,
  buildStatusSeries,
  buildTypeSeries,
  buildDurationSeries,
  buildDurationByType,
  buildDurationSummary,
  getDurationTaskTypes,
  buildHourHeatmap,
  isHourlyPartial
} from './historyData';
import { Panel, Metric, Sparkline, StackBar, Legend, RankList, DurationList, Heatmap, SectionIcon, formatPercent } from '../../../utils/dashboard/ui';
import { getClientIanaTimezone } from '../utils';
import style from '../../../utils/dashboard/dashboard.module.scss';

const BUCKET_AVG_LABEL_ID = { day: 'DailyAvg', week: 'WeeklyAvg', month: 'MonthlyAvg' };
const GRANULARITY_LABEL_ID = { day: 'Granularity_day', week: 'Granularity_week', month: 'Granularity_month' };
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);

const typeColor = index => TASK_TYPE_COLOR_MAP[index % TASK_TYPE_COLOR_MAP.length];
const statusLabelId = status => status.charAt(0).toUpperCase() + status.slice(1);
const sum = values => values.reduce((total, v) => total + (Number(v) || 0), 0);
const rate = (value, total) => (total > 0 ? Math.round((value / total) * 1000) / 10 : null);

const axisTooltip = (title, formatLine, footer, base = tooltipStyle) => ({
  ...base,
  formatter: params => {
    const list = Array.isArray(params) ? params : [params];
    const index = list[0]?.dataIndex ?? 0;
    const lines = list.map(p => `${p.marker} ${p.seriesName}　<b>${formatLine(p)}</b>`).join('<br/>');
    const footerText = footer ? `<div style="margin-top:6px;color:${PALETTE.muted}">${footer(index)}</div>` : '';
    return `<div style="font-weight:600;margin-bottom:6px">${title(index)}</div>${lines}${footerText}`;
  }
});

const categoryAxis = (keys, granularity) => ({
  type: 'category',
  data: keys,
  axisLine: axisLineStyle,
  axisTick: { show: false },
  axisLabel: { ...axisLabelStyle, hideOverlap: true, formatter: key => formatBucketAxisLabel(key, granularity) }
});

const countAxis = { type: 'value', minInterval: 1, min: 0, splitLine: splitLineStyle, axisLabel: axisLabelStyle };

const HistoryContent = ({ Echart, data, range, getTypeLabel, state, setState }) => {
  const { formatMessage } = useIntl();
  const isMobile = useIsMobile();
  const { trendMode, durationRunnerMode, durationTypes } = state;
  const { granularity, keys } = resolveBuckets(data, range);
  const bucketTitle = index => formatBucketTitle(keys[index], granularity);
  const noData = formatMessage({ id: 'NoData' });
  const totalLabel = formatMessage({ id: 'TotalCount' });
  const waitingLabel = formatMessage({ id: 'AvgWaitingTime' });
  const executionLabel = formatMessage({ id: 'AvgExecutionTime' });

  const byStatus = data?.byStatus || {};
  const [successTotal, failedTotal, canceledTotal] = COMPLETED_STATUS_LIST.map(status => Number(byStatus[status]) || 0);
  const completedTotal = successTotal + failedTotal + canceledTotal;
  const statusSeries = buildStatusSeries(data, keys, granularity);
  const bucketTotals = keys.map((_, i) => sum(COMPLETED_STATUS_LIST.map(status => statusSeries[status][i])));
  const bucketRates = keys.map((_, i) => rate(statusSeries.success[i], bucketTotals[i]));
  const durationSummary = buildDurationSummary(data);
  const overallDurationSeries = buildDurationSeries(data, keys, granularity, 'all', []);
  const bucketAvg = keys.length > 0 ? Math.round((completedTotal / keys.length) * 10) / 10 : 0;

  // 任务趋势
  const typeSeries = buildTypeSeries(data, keys, granularity);
  const typeOrder = typeSeries.map(s => s.type);
  const typeColorOf = type => typeColor(Math.max(typeOrder.indexOf(type), 0));
  const successRateLabel = formatMessage({ id: 'SuccessRate' });
  const trendOption =
    trendMode === 'type'
      ? {
          tooltip: axisTooltip(
            bucketTitle,
            p => p.value,
            i => `${totalLabel} ${bucketTotals[i]}`
          ),
          legend: { ...legendCenterStyle, type: 'scroll' },
          grid: lineChartGrid,
          xAxis: categoryAxis(keys, granularity),
          yAxis: countAxis,
          series: roundStackedBarTops(
            typeSeries.map(({ type, values }, i) => ({
              name: getTypeLabel(type),
              type: 'bar',
              stack: 'total',
              barMaxWidth: 24,
              data: values,
              itemStyle: { color: typeColor(i) },
              emphasis: { focus: 'series' }
            }))
          )
        }
      : {
          tooltip: axisTooltip(
            bucketTitle,
            p => (p.seriesName === successRateLabel ? (p.value == null ? '-' : `${p.value}%`) : p.value),
            i => `${totalLabel} ${bucketTotals[i]}`
          ),
          legend: legendCenterStyle,
          grid: lineChartGrid,
          xAxis: categoryAxis(keys, granularity),
          yAxis: [
            countAxis,
            { type: 'value', min: 0, max: 100, splitLine: { show: false }, axisLabel: { ...axisLabelStyle, formatter: '{value}%' } }
          ],
          series: roundStackedBarTops([
            ...COMPLETED_STATUS_LIST.map(status => ({
              name: formatMessage({ id: statusLabelId(status) }),
              type: 'bar',
              stack: 'total',
              barMaxWidth: 24,
              data: statusSeries[status],
              itemStyle: { color: STATUS_COLOR_MAP[status] },
              emphasis: { focus: 'series' }
            })),
            {
              name: successRateLabel,
              type: 'line',
              yAxisIndex: 1,
              smooth: 0.15,
              connectNulls: true,
              symbol: 'circle',
              symbolSize: 7,
              showSymbol: keys.length <= 13,
              data: bucketRates,
              z: 3,
              lineStyle: { width: 2, color: PALETTE.rate },
              itemStyle: { color: PALETTE.rate, borderColor: '#fff', borderWidth: 2 },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: `${PALETTE.rate}1f` },
                    { offset: 1, color: `${PALETTE.rate}00` }
                  ]
                }
              }
            }
          ])
        };

  // 构成
  const statusItems = COMPLETED_STATUS_LIST.map(status => ({
    key: status,
    label: formatMessage({ id: statusLabelId(status) }),
    value: Number(byStatus[status]) || 0,
    color: STATUS_COLOR_MAP[status]
  }));
  const byRunnerType = data?.byRunnerType || {};
  const runnerItems = [
    { key: 'manual', label: formatMessage({ id: 'ManualExecution' }), value: Number(byRunnerType.manual) || 0, color: PALETTE.manual },
    { key: 'system', label: formatMessage({ id: 'AutomaticExecution' }), value: Number(byRunnerType.system) || 0, color: PALETTE.system }
  ];
  const typeItems = Object.entries(data?.byType || {})
    .map(([type, count]) => ({ key: String(type), label: getTypeLabel(type), value: Number(count) || 0, color: typeColorOf(String(type)) }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // 耗时
  const durationTaskTypes = getDurationTaskTypes(data, durationRunnerMode);
  const effectiveDurationTypes = durationTypes.filter(type => durationTaskTypes.includes(type));
  const durationSeries = buildDurationSeries(data, keys, granularity, durationRunnerMode, effectiveDurationTypes);
  const durationLine = (name, field, color) => ({
    name,
    type: 'line',
    smooth: lineSmooth,
    connectNulls: true,
    symbol: 'circle',
    symbolSize: 5,
    showSymbol: keys.length <= 13,
    data: durationSeries.map(item => (item ? Math.round(item[field]) : null)),
    lineStyle: { width: 2, color },
    itemStyle: { color },
    areaStyle: { color: `${color}12` }
  });
  const durationTrendOption = {
    tooltip: axisTooltip(
      bucketTitle,
      p => formatDuration(p.value),
      i => (durationSeries[i]?.count ? `${totalLabel} ${Math.round(durationSeries[i].count)}` : ''),
      lineTooltipStyle
    ),
    legend: legendCenterStyle,
    grid: lineChartGrid,
    xAxis: { ...categoryAxis(keys, granularity), boundaryGap: false },
    yAxis: { type: 'value', min: 0, splitLine: splitLineStyle, axisLabel: { ...axisLabelStyle, formatter: v => formatDuration(v) } },
    series: [durationLine(executionLabel, 'avgExecutionTime', PALETTE.running), durationLine(waitingLabel, 'avgWaitingTime', PALETTE.waiting)]
  };
  const durationItems = buildDurationByType(data, durationRunnerMode)
    .filter(item => effectiveDurationTypes.length === 0 || effectiveDurationTypes.includes(item.type))
    .map(item => ({
      key: item.type,
      label: getTypeLabel(item.type),
      waiting: item.avgWaitingTime || 0,
      execution: item.avgExecutionTime || 0,
      count: item.count
    }))
    .sort((a, b) => b.waiting + b.execution - (a.waiting + a.execution));

  // 完成时段热力图
  const weekdays = Array.from({ length: 7 }, (_, i) => formatMessage({ id: `Weekday_${i + 1}` }));
  const heatmap = buildHourHeatmap(data);
  let peak = null;
  heatmap.forEach((row, weekday) =>
    row.forEach((cell, hour) => {
      if (cell.total > 0 && (!peak || cell.total > peak.total)) peak = { ...cell, weekday, hour };
    })
  );
  const renderHeatTooltip = (weekday, hour) => {
    const cell = heatmap[weekday][hour];
    return (
      <>
        <div>
          {weekdays[weekday]} {HOURS[hour]} · {totalLabel} <b>{cell.total}</b>
        </div>
        {cell.total > 0 ? (
          <div style={{ opacity: 0.75 }}>
            {COMPLETED_STATUS_LIST.map(status => `${formatMessage({ id: statusLabelId(status) })} ${cell[status]}`).join(' · ')}
          </div>
        ) : null}
      </>
    );
  };

  const typeSelectColorMap = Object.fromEntries(durationTaskTypes.map(type => [type, typeColorOf(type)]));
  const runnerOptions = [
    { label: formatMessage({ id: 'DurationByTypeRunnerAll' }), value: 'all' },
    { label: formatMessage({ id: 'DurationByTypeRunnerManual' }), value: 'manual' },
    { label: formatMessage({ id: 'DurationByTypeRunnerSystem' }), value: 'system' }
  ];
  const chartHeight = isMobile ? 240 : 280;

  return (
    <>
      <div className={style.metricStrip}>
        <Metric
          label={formatMessage({ id: 'CompletedTasks' })}
          card
          value={completedTotal.toLocaleString()}
          hint={`${formatMessage({ id: BUCKET_AVG_LABEL_ID[granularity] })} ${bucketAvg.toLocaleString()}`}
        >
          <Sparkline values={bucketTotals} color={PALETTE.total} />
        </Metric>
        <Metric
          label={successRateLabel}
          card
          state={completedTotal > 0 ? pickMetricState(successTotal / completedTotal, { warn: 0.95, danger: 0.8 }) : undefined}
          value={formatPercent(successTotal, completedTotal)}
          hint={`${formatMessage({ id: 'Success' })} ${successTotal.toLocaleString()}`}
        >
          <Sparkline values={bucketRates} color={PALETTE.success} />
        </Metric>
        <Metric
          label={formatMessage({ id: 'Failed' })}
          card
          state={completedTotal > 0 ? pickMetricState(failedTotal / completedTotal, { warn: 0.05, danger: 0.2, higherIsWorse: true }) : undefined}
          value={failedTotal.toLocaleString()}
          hint={`${formatMessage({ id: 'FailureRate' })} ${formatPercent(failedTotal, completedTotal)}`}
        >
          <Sparkline values={statusSeries.failed} color={PALETTE.failed} />
        </Metric>
        <Metric
          label={executionLabel}
          card
          value={formatDuration(durationSummary?.avgExecutionTime)}
          hint={`${formatMessage({ id: 'AvgTotalTime' })} ${formatDuration(durationSummary?.avgTotalTime)}`}
        >
          <Sparkline values={overallDurationSeries.map(item => item?.avgExecutionTime ?? null)} color={PALETTE.running} />
        </Metric>
        <Metric label={waitingLabel} card value={formatDuration(durationSummary?.avgWaitingTime)} hint={'\u00a0'}>
          <Sparkline values={overallDurationSeries.map(item => item?.avgWaitingTime ?? null)} color={PALETTE.waiting} />
        </Metric>
      </div>

      <Panel
        title={formatMessage({ id: 'TaskTrend' })}
        extra={
          <Segmented
            size="small"
            className={style.segmented}
            value={trendMode}
            onChange={value => setState({ trendMode: value })}
            options={[
              { label: formatMessage({ id: 'HourlyTrendModeByStatus' }), value: 'status' },
              { label: formatMessage({ id: 'HourlyTrendModeByType' }), value: 'type' }
            ]}
          />
        }
      >
        <Echart key={`${range}-${trendMode}`} style={{ height: isMobile ? 260 : 320 }} option={trendOption} />
      </Panel>

      <div className={style.splitGrid}>
        <Panel title={formatMessage({ id: 'Composition' })}>
          <div className={style.block}>
            <div className={style.blockTitle}>{formatMessage({ id: 'StatusDistribution' })}</div>
            <StackBar items={statusItems} />
            <Legend items={statusItems} />
          </div>
          <div className={style.block}>
            <div className={style.blockTitle}>{formatMessage({ id: 'RunnerTypeDistribution' })}</div>
            <StackBar items={runnerItems} />
            <Legend items={runnerItems} />
          </div>
          <div className={style.block}>
            <div className={style.blockTitle}>{formatMessage({ id: 'TaskTypeDistribution' })}</div>
            <div className={style.scrollList}>
              <RankList items={typeItems} emptyText={noData} />
            </div>
          </div>
        </Panel>

        <Panel
          title={formatMessage({ id: 'DurationAnalysis' })}
          extra={
            <div className={style.durationExtra}>
              <Segmented
                size="small"
                className={style.segmented}
                value={durationRunnerMode}
                onChange={value => setState({ durationRunnerMode: value })}
                options={runnerOptions}
              />
              <Select
                mode="multiple"
                allowClear
                showSearch={false}
                size="small"
                maxTagCount="responsive"
                className={style.typeSelect}
                value={effectiveDurationTypes}
                options={durationTaskTypes.map(type => ({ value: type, label: getTypeLabel(type) }))}
                placeholder={formatMessage({ id: 'TaskTypeFilterPlaceholder' })}
                onChange={value => setState({ durationTypes: value })}
                tagRender={({ label, value, closable, onClose }) => {
                  const color = typeSelectColorMap[value] || PALETTE.total;
                  return (
                    <Tag
                      className={style.typeTag}
                      closable={closable}
                      onClose={onClose}
                      style={{ color, borderColor: `${color}40`, background: `${color}10` }}
                    >
                      {label}
                    </Tag>
                  );
                }}
              />
            </div>
          }
        >
          <div className={style.blockTitle}>{formatMessage({ id: 'DurationTrend' })}</div>
          <Echart
            key={`duration-${range}-${durationRunnerMode}-${effectiveDurationTypes.join(',')}`}
            style={{ height: chartHeight }}
            option={durationTrendOption}
          />
          <div className={`${style.blockTitle} ${style.blockTitleSpaced}`}>{formatMessage({ id: 'TypeDurationTitle' })}</div>
          <div className={style.scrollList}>
            <DurationList
              format={formatDuration}
              items={durationItems}
              waitingLabel={formatMessage({ id: 'Waiting' })}
              executionLabel={formatMessage({ id: 'Execution' })}
              waitingColor={PALETTE.waiting}
              executionColor={PALETTE.running}
              countText={count => formatMessage({ id: 'SampleCount' }, { count })}
              emptyText={noData}
            />
          </div>
        </Panel>
      </div>

      <Panel
        title={formatMessage({ id: 'CompletionHeatmap' })}
        subtitle={isHourlyPartial(keys, granularity) ? formatMessage({ id: 'HourlyRetentionHint' }) : null}
        extra={
          peak ? (
            <span className={style.peakText}>
              {formatMessage({ id: 'PeakHour' })} <b>{`${weekdays[peak.weekday]} ${HOURS[peak.hour]}`}</b> · {peak.total}
            </span>
          ) : null
        }
      >
        <Heatmap
          values={heatmap.map(row => row.map(cell => cell.total))}
          rowLabels={weekdays}
          columnLabels={HOURS}
          labelStep={isMobile ? 6 : 3}
          color={PALETTE.total}
          peak={peak ? { row: peak.weekday, col: peak.hour } : null}
          renderTooltip={renderHeatTooltip}
          lessText={formatMessage({ id: 'Less' })}
          moreText={formatMessage({ id: 'More' })}
        />
      </Panel>
    </>
  );
};

const HistorySection = createWithRemoteLoader({
  modules: ['components-thirdparty:Echart', 'components-core:Enum']
})(
  withLocale(({ remoteModules, apis }) => {
    const [Echart, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const [range, setRange] = useState('7d');
    const [spinning, setSpinning] = useState(false);
    const [state, setStateRaw] = useState({ trendMode: 'status', durationRunnerMode: 'all', durationTypes: [] });
    const setState = patch => setStateRaw(prev => ({ ...prev, ...patch }));
    const reloadRef = useRef(() => {});
    const rangeBuckets = resolveBuckets(null, range);
    const caption = `${formatRangeCaption(rangeBuckets.keys, rangeBuckets.granularity)} · ${formatMessage({
      id: GRANULARITY_LABEL_ID[rangeBuckets.granularity]
    })}`;

    return (
      <div className={style.section}>
        <div className={style.sectionHead}>
          <div className={style.sectionHeadMain}>
            <h3 className={style.sectionTitle}>
              <SectionIcon icon={<BarChartOutlined />} tone={PALETTE.manual} />
              {formatMessage({ id: 'HistoricalData' })}
            </h3>
            <span className={style.sectionCaption}>{caption}</span>
          </div>
          <div className={style.rangeSwitch} role="tablist">
            {RANGE_OPTIONS.map(r => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={range === r}
                className={`${style.rangeItem}${range === r ? ` ${style.rangeItemActive}` : ''}`}
                onClick={() => setRange(r)}
              >
                {formatMessage({ id: `Range_${r}` })}
              </button>
            ))}
            <span className={style.rangeDivider} />
            <Tooltip title={formatMessage({ id: 'Refresh' })}>
              <button
                type="button"
                className={`${style.rangeRefresh}${spinning ? ` ${style.rangeRefreshSpin}` : ''}`}
                onClick={() => {
                  setSpinning(true);
                  reloadRef.current();
                }}
                onAnimationEnd={() => setSpinning(false)}
              >
                <ReloadOutlined />
              </button>
            </Tooltip>
          </div>
        </div>

        <Fetch
          {...Object.assign({}, apis.task.statistics.getOverview, {
            params: { range, timezone: getClientIanaTimezone() }
          })}
          render={({ data, reload }) => {
            reloadRef.current = reload;
            return (
              <Enum moduleName="taskType">
                {taskTypeList => {
                  const typeLabelMap = {};
                  (taskTypeList || []).forEach(item => {
                    typeLabelMap[String(item.value)] = item.label || item.description || String(item.value);
                  });
                  return (
                    <HistoryContent
                      Echart={Echart}
                      data={data}
                      range={range}
                      getTypeLabel={type => typeLabelMap[String(type)] || String(type ?? '')}
                      state={state}
                      setState={setState}
                    />
                  );
                }}
              </Enum>
            );
          }}
        />
      </div>
    );
  })
);

export default HistorySection;
