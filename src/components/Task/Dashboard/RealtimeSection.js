import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIsMobile } from '@kne/responsive-utils';
import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Segmented } from 'antd';
import { RightOutlined, ThunderboltFilled } from '@ant-design/icons';
import { createThemeColors, defaultColors } from '@kne/react-box';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import {
  PALETTE,
  TIME_PERIODS,
  TASK_TYPE_COLOR_MAP,
  STATUS_COLOR_MAP,
  tooltipStyle,
  legendCenterStyle,
  lineChartGrid,
  axisLineStyle,
  axisLabelStyle,
  splitLineStyle,
  roundStackedBarTops,
  formatDuration,
  pickStatisticsDurationMs,
  sanitizeStatisticsDurationMs,
  resolveDurationMsForDashboard,
  sortTaskTypeKeys,
  pickMetricState
} from './constants';
import { Panel, Metric, StackBar, Legend, DurationList, LiveBadge, SectionIcon, formatPercent } from '../../../utils/dashboard/ui';
import useRealtimeStatisticsSSE from './useRealtimeStatisticsSSE';
import style from '../../../utils/dashboard/dashboard.module.scss';

const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
const REALTIME_STATUS_LIST = ['success', 'failed', 'canceled', 'running', 'waiting'];
const statusLabelId = status => status.charAt(0).toUpperCase() + status.slice(1);

/** 取第一个有效非负整数；用于统计类字段的多来源兼容 */
const pickNonNegativeInt = (...candidates) => {
  for (const v of candidates) {
    if (v === undefined || v === null) continue;
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return Math.trunc(n);
  }
  return 0;
};

/** rows: [{ hour, [key], count }] → { key: number[24] } */
const groupHourly = (rows, keyField) => {
  const map = {};
  (rows || []).forEach(item => {
    const h = Number(item?.hour);
    if (!Number.isInteger(h) || h < 0 || h >= 24) return;
    const key = keyField ? String(item?.[keyField] ?? '') : 'total';
    if (!key) return;
    if (!map[key]) map[key] = Array(24).fill(0);
    map[key][h] += Number(item?.count) || 0;
  });
  return map;
};

const pickDurationByType = (todayDuration, mode) => {
  const source = mode === 'all' ? todayDuration?.byType : todayDuration?.byTypeByRunnerType?.[mode];
  return Object.entries(source && typeof source === 'object' ? source : {})
    .map(([type, item]) => ({
      type,
      waiting: sanitizeStatisticsDurationMs(item?.avgWaitingTime) ?? 0,
      execution: sanitizeStatisticsDurationMs(item?.avgExecutionTime) ?? 0,
      count: Number(item?.count) || 0
    }))
    .filter(item => item.count > 0 || item.waiting + item.execution > 0)
    .sort((a, b) => b.waiting + b.execution - (a.waiting + a.execution));
};

const queueTheme = createThemeColors(defaultColors.Orange);
const queueThemeStyle = {
  '--queue-color': queueTheme.color,
  '--queue-deep': queueTheme.accentDeep,
  '--queue-border': queueTheme.hoverBorderColor,
  '--queue-surface': queueTheme.surface
};

const ManualQueueCard = ({ pending, maxWait, handled, handledTime, onGo }) => {
  const { formatMessage } = useIntl();
  const active = pending > 0;
  return (
    <section className={`${style.queueCard}${active ? ` ${style.queueCardActive}` : ''}`} style={queueThemeStyle}>
      <div className={style.queuePrimary}>
        <span className={style.queueTitle}>
          {active ? <span className={style.dot} style={{ background: queueTheme.color }} /> : null}
          {formatMessage({ id: 'ManualQueueTitle' })}
        </span>
        {active ? (
          <div className={style.queueMain}>
            <span className={style.queueValue}>{pending.toLocaleString()}</span>
            <span className={style.queueUnit}>{formatMessage({ id: 'ManualQueueUnit' })}</span>
          </div>
        ) : (
          <div className={style.queueEmpty}>{formatMessage({ id: 'ManualQueueEmpty' })}</div>
        )}
        {onGo ? (
          <button type="button" className={style.queueButton} onClick={onGo}>
            {formatMessage({ id: 'GoHandle' })}
            <RightOutlined />
          </button>
        ) : null}
      </div>
      <dl className={style.queueStats}>
        <div>
          <dt>{formatMessage({ id: 'ManualPendingMaxWaitLabel' })}</dt>
          <dd>{maxWait}</dd>
        </div>
        <div>
          <dt>{formatMessage({ id: 'ManualHandledToday' })}</dt>
          <dd>{handled.toLocaleString()}</dd>
        </div>
        <div>
          <dt>{formatMessage({ id: 'ManualHandledDuration' })}</dt>
          <dd>{handledTime || '-'}</dd>
        </div>
      </dl>
    </section>
  );
};

const RealtimeContent = ({ Echart, data, getTypeLabel, myTaskPath }) => {
  const { formatMessage } = useIntl();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [hourMode, setHourMode] = useState('type');
  const [durationMode, setDurationMode] = useState('all');

  const byStatus = data.byStatus || {};
  const statusCount = status => Number(byStatus[status]) || 0;
  const finished = statusCount('success') + statusCount('failed') + statusCount('canceled');
  const inProgress = statusCount('running') + statusCount('waiting');
  const totalTasks = Number(data.totalTasks) || finished + inProgress;
  const statusItems = REALTIME_STATUS_LIST.map(status => ({
    key: status,
    label: formatMessage({ id: statusLabelId(status) }),
    value: statusCount(status),
    color: STATUS_COLOR_MAP[status]
  }));

  /** 手动队列：主数字为当前等待人工操作的任务数，次信息为队列最长等待与今日已处理 */
  const manualRt = data.runnerTypeStats?.manual;
  const manualPending = pickNonNegativeInt(data.waitingByRunnerType?.manual, manualRt?.waiting, manualRt?.waitingCount);
  const manualDone = pickNonNegativeInt(data.completedToday?.manual);
  const manualMaxWaitMs = resolveDurationMsForDashboard(data.waitingQueueMaxWaitMsByRunnerType?.manual);
  const manualDoneMs = resolveDurationMsForDashboard(data.completedTodayTotalDurationMsByRunnerType?.manual);
  const goMyTasks = useCallback(() => myTaskPath && navigate(myTaskPath), [navigate, myTaskPath]);

  const todayDuration = data.todayDuration;
  const avgDuration = field => formatDuration(pickStatisticsDurationMs(todayDuration, field));

  const currentHour = new Date().getHours();
  const hourlyTotals = useMemo(() => {
    const totals = groupHourly(data.hourlyTrend).total || Array(24).fill(0);
    const byType = groupHourly(data.hourlyTrendByType, 'type');
    return totals.map((total, h) => total || Object.values(byType).reduce((n, values) => n + values[h], 0));
  }, [data.hourlyTrend, data.hourlyTrendByType]);
  const periods = TIME_PERIODS.map(period => ({
    ...period,
    total: hourlyTotals.slice(period.start, period.end).reduce((n, v) => n + v, 0),
    active: currentHour >= period.start && currentHour < period.end
  }));

  const typeMap = groupHourly(data.hourlyTrendByType, 'type');
  const statusMap = groupHourly(data.hourlyTrendByStatus, 'status');
  const hourlySeries =
    hourMode === 'status'
      ? REALTIME_STATUS_LIST.filter(status => statusMap[status]).map(status => ({
          name: formatMessage({ id: statusLabelId(status) }),
          values: statusMap[status],
          color: STATUS_COLOR_MAP[status]
        }))
      : sortTaskTypeKeys(Object.keys(typeMap)).map((type, i) => ({
          name: getTypeLabel(type),
          values: typeMap[type],
          color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length]
        }));
  const hourlyList =
    hourlySeries.length > 0 ? hourlySeries : [{ name: formatMessage({ id: 'TotalCount' }), values: hourlyTotals, color: PALETTE.total }];
  const hourlyOption = {
    tooltip: tooltipStyle,
    legend: { ...legendCenterStyle, type: 'scroll' },
    grid: lineChartGrid,
    xAxis: {
      type: 'category',
      data: HOURS,
      axisLine: axisLineStyle,
      axisTick: { show: false },
      axisLabel: { ...axisLabelStyle, interval: isMobile ? 5 : 2 }
    },
    yAxis: { type: 'value', minInterval: 1, min: 0, splitLine: splitLineStyle, axisLabel: axisLabelStyle },
    series: roundStackedBarTops(
      hourlyList.map(({ name, values, color }, index) => ({
        name,
        type: 'bar',
        stack: 'total',
        barMaxWidth: 18,
        data: values,
        itemStyle: { color },
        emphasis: { focus: 'series' },
        ...(index === 0
          ? {
              markLine: {
                silent: true,
                symbol: 'none',
                lineStyle: { color: PALETTE.ink, opacity: 0.35, type: 'dashed' },
                label: { formatter: formatMessage({ id: 'Now' }), color: PALETTE.muted, fontSize: 11 },
                data: [{ xAxis: HOURS[currentHour] }]
              }
            }
          : {})
      }))
    )
  };

  const durationItems = pickDurationByType(todayDuration, durationMode).map(item => ({
    ...item,
    key: item.type,
    label: getTypeLabel(item.type)
  }));

  return (
    <>
      <div className={style.realtimeTop}>
        <div className={style.metricStrip}>
          <Metric
            card
            label={formatMessage({ id: 'TodayTasks' })}
            value={totalTasks.toLocaleString()}
            segments={[
              { key: 'finished', label: formatMessage({ id: 'Finished' }), value: finished, color: PALETTE.total },
              { key: 'inProgress', label: formatMessage({ id: 'InProgress' }), value: inProgress, color: PALETTE.running }
            ]}
          />
          <Metric
            card
            label={formatMessage({ id: 'SuccessRate' })}
            value={formatPercent(statusCount('success'), finished)}
            state={finished > 0 ? pickMetricState(statusCount('success') / finished, { warn: 0.95, danger: 0.8 }) : undefined}
            segments={['success', 'failed', 'canceled']
              .filter(status => status !== 'canceled' || statusCount(status) > 0)
              .map(status => ({
                key: status,
                label: formatMessage({ id: statusLabelId(status) }),
                value: statusCount(status),
                color: STATUS_COLOR_MAP[status]
              }))}
          />
          <Metric
            card
            label={formatMessage({ id: 'InProgress' })}
            value={inProgress.toLocaleString()}
            segments={['running', 'waiting'].map(status => ({
              key: status,
              label: formatMessage({ id: statusLabelId(status) }),
              value: statusCount(status),
              color: STATUS_COLOR_MAP[status]
            }))}
          />
          <Metric
            card
            label={formatMessage({ id: 'AvgTotalTime' })}
            value={avgDuration('avgTotalTime')}
            segments={[
              { key: 'waiting', field: 'avgWaitingTime', id: 'Waiting', color: PALETTE.waiting },
              { key: 'execution', field: 'avgExecutionTime', id: 'Execution', color: PALETTE.running }
            ].map(({ key, field, id, color }) => ({
              key,
              label: formatMessage({ id }),
              value: pickStatisticsDurationMs(todayDuration, field) || 0,
              display: avgDuration(field),
              color
            }))}
          />
        </div>
        <ManualQueueCard
          pending={manualPending}
          maxWait={manualPending > 0 && manualMaxWaitMs != null ? formatDuration(manualMaxWaitMs) : '-'}
          handled={manualDone}
          handledTime={manualDone > 0 && manualDoneMs != null ? formatDuration(manualDoneMs) : null}
          onGo={myTaskPath ? goMyTasks : null}
        />
      </div>

      <div className={style.mainGrid}>
        <Panel
          title={formatMessage({ id: 'TodayHourly' })}
          extra={
            <Segmented
              size="small"
              className={style.segmented}
              value={hourMode}
              onChange={setHourMode}
              options={[
                { label: formatMessage({ id: 'HourlyTrendModeByType' }), value: 'type' },
                { label: formatMessage({ id: 'HourlyTrendModeByStatus' }), value: 'status' }
              ]}
            />
          }
        >
          <div className={style.periodRow}>
            {periods.map(period => (
              <div key={period.id} className={`${style.periodCell}${period.active ? ` ${style.periodCellActive}` : ''}`}>
                <span className={style.periodLabel}>
                  {formatMessage({ id: period.id })}
                  <span className={style.periodRange}>
                    {String(period.start).padStart(2, '0')}–{String(period.end).padStart(2, '0')}
                  </span>
                </span>
                <span className={style.periodValue}>{period.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <Echart key={hourMode} style={{ height: isMobile ? 240 : 300 }} option={hourlyOption} />
        </Panel>

        <div className={style.sideStack}>
          <Panel title={formatMessage({ id: 'TodayStatus' })}>
            <StackBar items={statusItems} />
            <Legend items={statusItems} />
          </Panel>
          <Panel
            title={formatMessage({ id: 'TypeDurationTitle' })}
            extra={
              <Segmented
                size="small"
                className={style.segmented}
                value={durationMode}
                onChange={setDurationMode}
                options={[
                  { label: formatMessage({ id: 'DurationByTypeRunnerAll' }), value: 'all' },
                  { label: formatMessage({ id: 'DurationByTypeRunnerManual' }), value: 'manual' },
                  { label: formatMessage({ id: 'DurationByTypeRunnerSystem' }), value: 'system' }
                ]}
              />
            }
          >
            <div className={style.scrollList}>
              <DurationList
                format={formatDuration}
                items={durationItems}
                waitingLabel={formatMessage({ id: 'Waiting' })}
                executionLabel={formatMessage({ id: 'Execution' })}
                waitingColor={PALETTE.waiting}
                executionColor={PALETTE.running}
                countText={count => formatMessage({ id: 'SampleCount' }, { count })}
                emptyText={formatMessage({ id: 'NoData' })}
              />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
};

const RealtimeSection = createWithRemoteLoader({
  modules: ['components-thirdparty:Echart', 'components-core:Enum']
})(
  withLocale(({ remoteModules, apis, ajax, baseUrl }) => {
    const [Echart, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const myTaskPath = useMemo(() => {
      if (baseUrl == null || baseUrl === '') return null;
      return `${String(baseUrl).replace(/\/$/, '')}/task/my`;
    }, [baseUrl]);
    const { realtimeData, isConnected, lastUpdatedAt } = useRealtimeStatisticsSSE(apis?.task?.statistics?.sse?.url, ajax);

    const lastUpdatedText = useMemo(() => {
      if (!lastUpdatedAt) return '';
      try {
        return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(
          new Date(lastUpdatedAt)
        );
      } catch {
        return new Date(lastUpdatedAt).toLocaleTimeString();
      }
    }, [lastUpdatedAt]);

    return (
      <div className={style.section}>
        <div className={style.sectionHead}>
          <div className={style.sectionHeadMain}>
            <h3 className={style.sectionTitle}>
              <SectionIcon icon={<ThunderboltFilled />} tone={PALETTE.total} />
              {formatMessage({ id: 'RealtimeData' })}
            </h3>
            <span className={style.sectionCaption}>
              {formatMessage({ id: 'Today' })} {realtimeData?.date || ''}
            </span>
          </div>
          <LiveBadge
            connected={isConnected}
            text={formatMessage({ id: isConnected ? 'RealtimeConnected' : 'RealtimeDisconnected' })}
            time={lastUpdatedText ? `${formatMessage({ id: 'LastUpdatedAt' })} ${lastUpdatedText}` : ''}
          />
        </div>
        {realtimeData ? (
          <Enum moduleName="taskType">
            {taskTypeList => {
              const typeLabelMap = {};
              (taskTypeList || []).forEach(item => {
                typeLabelMap[String(item.value)] = item.label || item.description || String(item.value);
              });
              return (
                <RealtimeContent
                  Echart={Echart}
                  data={realtimeData}
                  myTaskPath={myTaskPath}
                  getTypeLabel={type => typeLabelMap[String(type)] || String(type ?? '')}
                />
              );
            }}
          </Enum>
        ) : (
          <Panel>
            <div className={style.emptyLarge}>{formatMessage({ id: isConnected ? 'WaitingForData' : 'RealtimeDisconnected' })}</div>
          </Panel>
        )}
      </div>
    );
  })
);

export default RealtimeSection;
