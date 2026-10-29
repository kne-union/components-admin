import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useIsMobile } from '@kne/responsive-utils';
import { useState, useRef } from 'react';
import { Tooltip } from 'antd';
import { BarChartOutlined, ReloadOutlined } from '@ant-design/icons';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import {
  PALETTE,
  CHANNELS,
  CODE_COLOR_MAP,
  RANGE_OPTIONS,
  tooltipStyle,
  legendCenterStyle,
  lineChartGrid,
  axisLineStyle,
  axisLabelStyle,
  splitLineStyle,
  roundStackedBarTops
} from './constants';
import { Panel, Metric, Sparkline, StackBar, Legend, RankList, SectionIcon, formatPercent } from '../../../utils/dashboard/ui';
import { getClientIanaTimezone } from '../utils';
import style from '../../../utils/dashboard/dashboard.module.scss';

const RANGE_DAY_COUNT = { '7d': 7, '1m': 30, '3m': 90, '1y': 365 };
const RANGE_AXIS_UNIT = { '7d': 'day', '1m': 'month', '3m': 'month', '1y': 'year' };
const RANGE_MONTH_COUNT = { '1m': 1, '3m': 3 };

const getAxisUnit = rangeKey => RANGE_AXIS_UNIT[rangeKey] || 'day';

const formatAxisKey = (date, unit) => {
  const value = String(date || '');
  if (unit === 'year') return value.slice(0, 4);
  if (unit === 'month') return value.slice(0, 7);
  return value.slice(0, 10);
};

/** 本地日历上从 range 起点到今天的时间轴，随视图切换日/月/年粒度 */
const buildLocalAxisForRange = rangeKey => {
  const axisUnit = getAxisUnit(rangeKey);
  if (axisUnit === 'year') {
    const now = new Date();
    const startYear = now.getFullYear() - 1;
    return Array.from({ length: now.getFullYear() - startYear + 1 }, (_, i) => String(startYear + i));
  }

  if (axisUnit === 'month') {
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    cursor.setDate(1);
    cursor.setMonth(cursor.getMonth() - (RANGE_MONTH_COUNT[rangeKey] || 1));
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    end.setDate(1);

    const months = [];
    while (cursor <= end) {
      months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }

  const days = RANGE_DAY_COUNT[rangeKey] || 7;
  return Array.from({ length: days }, (_, index) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1 - index));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
};

/** recentTrend / recentTrendByType → 按时间轴排序的 { date, total, email, sms } */
const buildTrendRows = (data, range) => {
  const recentTrend = data?.recentTrend || [];
  const recentTrendByType = data?.recentTrendByType || [];
  const axisUnit = getAxisUnit(range);
  const dateMap = {};
  const ensure = date => (dateMap[date] = dateMap[date] || { date, total: 0, email: 0, sms: 0 });

  buildLocalAxisForRange(range).forEach(ensure);
  recentTrend.forEach(item => {
    ensure(formatAxisKey(item.date, axisUnit)).total += Number(item.count) || 0;
  });
  recentTrendByType.forEach(item => {
    const row = ensure(formatAxisKey(item.date, axisUnit));
    row[item.type === 0 ? 'email' : 'sms'] += Number(item.count) || 0;
  });
  return Object.values(dateMap)
    .map(row => ({ ...row, total: row.total || row.email + row.sms }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const HistoryContent = ({ Echart, data, range }) => {
  const { formatMessage } = useIntl();
  const isMobile = useIsMobile();

  const byType = data?.byType || {};
  const templateStats = data?.templateStats || {};
  const totalRecords = Number(data?.totalRecords) || 0;
  const channelValue = { email: Number(byType['0']) || 0, sms: Number(byType['1']) || 0 };
  const channelItems = CHANNELS.map(channel => ({
    key: channel.key,
    label: formatMessage({ id: channel.labelId }),
    value: channelValue[channel.key],
    color: channel.color
  }));
  const templateItems = [
    { key: 'enabled', label: formatMessage({ id: 'EnabledTemplates' }), value: Number(templateStats.byStatus?.['0']) || 0, color: PALETTE.enabled },
    { key: 'disabled', label: formatMessage({ id: 'DisabledTemplates' }), value: Number(templateStats.byStatus?.['1']) || 0, color: PALETTE.disabled }
  ];
  const codeItems = Object.entries(data?.byCode || {})
    .map(([code, count]) => ({ key: code, label: code, value: Number(count) || 0 }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({ ...item, color: CODE_COLOR_MAP[index % CODE_COLOR_MAP.length] }));

  const rows = buildTrendRows(data, range);
  const totalLabel = formatMessage({ id: 'TotalCount' });
  const trendOption = {
    tooltip: {
      ...tooltipStyle,
      formatter: params => {
        const list = Array.isArray(params) ? params : [params];
        const row = rows[list[0]?.dataIndex] || {};
        const lines = list.map(p => `${p.marker} ${p.seriesName}　<b>${p.value}</b>`).join('<br/>');
        return `<div style="font-weight:600;margin-bottom:4px">${row.date || ''}</div>${lines}<div style="color:${PALETTE.muted};margin-top:4px">${totalLabel} ${row.total ?? 0}</div>`;
      }
    },
    legend: legendCenterStyle,
    grid: lineChartGrid,
    xAxis: {
      type: 'category',
      data: rows.map(row => row.date),
      axisLine: axisLineStyle,
      axisTick: { show: false },
      axisLabel: { ...axisLabelStyle, hideOverlap: true }
    },
    yAxis: { type: 'value', minInterval: 1, min: 0, splitLine: splitLineStyle, axisLabel: axisLabelStyle },
    series: roundStackedBarTops(
      CHANNELS.map(channel => ({
        name: formatMessage({ id: channel.labelId }),
        type: 'bar',
        stack: 'total',
        barMaxWidth: 24,
        data: rows.map(row => row[channel.key]),
        itemStyle: { color: channel.color },
        emphasis: { focus: 'series' }
      }))
    )
  };

  const noData = formatMessage({ id: 'NoData' });

  return (
    <>
      <div className={style.metricStrip} style={{ gridTemplateColumns: isMobile ? undefined : 'repeat(4, minmax(0, 1fr))' }}>
        <Metric card label={formatMessage({ id: 'TotalRecords' })} value={totalRecords.toLocaleString()} hint={'\u00a0'}>
          <Sparkline values={rows.map(row => row.total)} color={PALETTE.total} />
        </Metric>
        {CHANNELS.map(channel => (
          <Metric
            key={channel.key}
            card
            label={formatMessage({ id: channel.labelId })}
            value={channelValue[channel.key].toLocaleString()}
            hint={`${formatMessage({ id: 'Share' })} ${formatPercent(channelValue[channel.key], totalRecords)}`}
          >
            <Sparkline values={rows.map(row => row[channel.key])} color={channel.color} />
          </Metric>
        ))}
        <Metric
          card
          label={formatMessage({ id: 'TemplateTotal' })}
          value={(Number(templateStats.total) || 0).toLocaleString()}
          segments={templateItems}
        />
      </div>

      <Panel title={formatMessage({ id: 'RecentTrend' })}>
        <Echart key={range} style={{ height: isMobile ? 260 : 320 }} option={trendOption} />
      </Panel>

      <div className={style.splitGrid}>
        <Panel title={formatMessage({ id: 'Composition' })}>
          <div className={style.block}>
            <div className={style.blockTitle}>{formatMessage({ id: 'TypeDistribution' })}</div>
            <StackBar items={channelItems} />
            <Legend items={channelItems} />
          </div>
          <div className={style.block}>
            <div className={style.blockTitle}>{formatMessage({ id: 'TemplateStatus' })}</div>
            <StackBar items={templateItems} />
            <Legend items={templateItems} />
          </div>
        </Panel>
        <Panel title={formatMessage({ id: 'ByCodeStats' })}>
          <div className={style.scrollList}>
            <RankList items={codeItems} emptyText={noData} />
          </div>
        </Panel>
      </div>
    </>
  );
};

const HistorySection = createWithRemoteLoader({
  modules: ['components-thirdparty:Echart']
})(
  withLocale(({ remoteModules, apis }) => {
    const [Echart] = remoteModules;
    const { formatMessage } = useIntl();
    const [range, setRange] = useState('7d');
    const [spinning, setSpinning] = useState(false);
    const reloadRef = useRef(() => {});

    return (
      <div className={style.section}>
        <div className={style.sectionHead}>
          <div className={style.sectionHeadMain}>
            <h3 className={style.sectionTitle}>
              <SectionIcon icon={<BarChartOutlined />} tone={PALETTE.email} />
              {formatMessage({ id: 'HistoricalData' })}
            </h3>
            <span className={style.sectionCaption}>{formatMessage({ id: `Range_${range}` })}</span>
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
          {...Object.assign({}, apis.messageManger.statistics.getOverview, {
            params: { range, timezone: getClientIanaTimezone() }
          })}
          render={({ data, reload }) => {
            reloadRef.current = reload;
            return <HistoryContent Echart={Echart} data={data} range={range} />;
          }}
        />
      </div>
    );
  })
);

export default HistorySection;
