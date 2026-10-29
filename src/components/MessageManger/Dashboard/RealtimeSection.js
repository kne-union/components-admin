import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIsMobile } from '@kne/responsive-utils';
import { useMemo } from 'react';
import { ThunderboltFilled } from '@ant-design/icons';
import { defaultColors } from '@kne/react-box';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import {
  PALETTE,
  CHANNELS,
  TIME_PERIODS,
  tooltipStyle,
  legendCenterStyle,
  lineChartGrid,
  axisLineStyle,
  axisLabelStyle,
  splitLineStyle,
  roundStackedBarTops
} from './constants';
import { Panel, Metric, StackBar, Legend, DurationList, LiveBadge, SectionIcon, formatPercent } from '../../../utils/dashboard/ui';
import useRealtimeStatisticsSSE from './useRealtimeStatisticsSSE';
import style from '../../../utils/dashboard/dashboard.module.scss';

const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
const STATUS_LIST = [
  { key: 'success', labelId: 'StatusSuccess', color: defaultColors.Green },
  { key: 'failed', labelId: 'StatusFailed', color: defaultColors.Red },
  { key: 'running', labelId: 'StatusRunning', color: defaultColors.Orange },
  { key: 'pending', labelId: 'StatusPending', color: defaultColors.Blue },
  { key: 'canceled', labelId: 'StatusCanceled', color: PALETTE.disabled }
];

/**
 * 合并 hourlyTrend（按小时总量）与 hourlyTrendByType（按小时+类型），得到 0–23 点完整序列；
 * 后端未返回 hourly 聚合时，退回 records 计算。
 */
const buildTodayHourlySlots = raw => {
  const slots = Array.from({ length: 24 }, () => ({ total: 0, email: 0, sms: 0, hasTotal: false }));
  const hourlyTrend = Array.isArray(raw?.hourlyTrend) ? raw.hourlyTrend : [];
  const hourlyTrendByType = Array.isArray(raw?.hourlyTrendByType) ? raw.hourlyTrendByType : [];
  const validHour = h => Number.isInteger(h) && h >= 0 && h < 24;

  if (hourlyTrend.length > 0 || hourlyTrendByType.length > 0) {
    hourlyTrend.forEach(item => {
      const h = Number(item?.hour);
      if (!validHour(h)) return;
      slots[h].total = Number(item?.count) || 0;
      slots[h].hasTotal = true;
    });
    hourlyTrendByType.forEach(item => {
      const h = Number(item?.hour);
      if (!validHour(h)) return;
      const n = Number(item?.count) || 0;
      const type = Number(item?.type);
      if (type === 0) slots[h].email += n;
      else if (type === 1) slots[h].sms += n;
    });
  } else {
    (Array.isArray(raw?.records) ? raw.records : []).forEach(item => {
      const date = item?.createdAt ? new Date(item.createdAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;
      const slot = slots[date.getHours()];
      const type = Number(item?.type);
      if (type === 0) slot.email += 1;
      else if (type === 1) slot.sms += 1;
      slot.total += 1;
      slot.hasTotal = true;
    });
  }
  slots.forEach(slot => {
    if (!slot.hasTotal) slot.total = slot.email + slot.sms;
  });
  return slots;
};

const groupStatus = rows => {
  const map = {};
  (Array.isArray(rows) ? rows : []).forEach(item => {
    const key = String(item?.status || '');
    if (!key) return;
    map[key] = (map[key] || 0) + (Number(item?.count) || 0);
  });
  return map;
};

const RealtimeContent = ({ Echart, data }) => {
  const { formatMessage } = useIntl();
  const isMobile = useIsMobile();

  const byType = data.byType && typeof data.byType === 'object' ? data.byType : {};
  const channelValue = { email: Number(byType['0']) || 0, sms: Number(byType['1']) || 0 };
  const totalRecords = Number.isFinite(Number(data.totalRecords)) ? Number(data.totalRecords) : channelValue.email + channelValue.sms;
  const channelItems = CHANNELS.map(channel => ({
    key: channel.key,
    label: formatMessage({ id: channel.labelId }),
    value: channelValue[channel.key],
    color: channel.color
  }));

  const slots = useMemo(() => buildTodayHourlySlots(data), [data]);
  const currentHour = new Date().getHours();
  const periods = TIME_PERIODS.map(period => {
    const range = slots.slice(period.start, period.end);
    const sum = field => range.reduce((n, slot) => n + slot[field], 0);
    return {
      ...period,
      total: sum('total'),
      email: sum('email'),
      sms: sum('sms'),
      active: currentHour >= period.start && currentHour < period.end
    };
  });

  const hasChannelHourly = slots.some(slot => slot.email + slot.sms > 0);
  const hourlySeries = hasChannelHourly
    ? CHANNELS.map(channel => ({ name: formatMessage({ id: channel.labelId }), values: slots.map(slot => slot[channel.key]), color: channel.color }))
    : [{ name: formatMessage({ id: 'TotalCount' }), values: slots.map(slot => slot.total), color: PALETTE.total }];
  const hourlyOption = {
    tooltip: tooltipStyle,
    legend: legendCenterStyle,
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
      hourlySeries.map(({ name, values, color }, index) => ({
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

  const statusMap = groupStatus(data.hourlyTrendByStatus);
  const statusItems = STATUS_LIST.filter(item => statusMap[item.key] !== undefined).map(item => ({
    key: item.key,
    label: formatMessage({ id: item.labelId }),
    value: statusMap[item.key],
    color: item.color
  }));

  const periodItems = periods.map(period => ({
    key: period.id,
    label: `${formatMessage({ id: period.id })} ${String(period.start).padStart(2, '0')}–${String(period.end).padStart(2, '0')}`,
    waiting: period.email,
    execution: period.sms
  }));

  const shareHint = value => `${formatMessage({ id: 'ShareOfToday' })} ${formatPercent(value, totalRecords)}`;

  return (
    <>
      <div className={style.metricStrip} style={{ gridTemplateColumns: isMobile ? undefined : 'repeat(3, minmax(0, 1fr))' }}>
        <Metric card label={formatMessage({ id: 'TodayRecords' })} value={totalRecords.toLocaleString()} segments={channelItems} />
        <Metric card label={formatMessage({ id: 'TodayEmail' })} value={channelValue.email.toLocaleString()} hint={shareHint(channelValue.email)} />
        <Metric card label={formatMessage({ id: 'TodaySMS' })} value={channelValue.sms.toLocaleString()} hint={shareHint(channelValue.sms)} />
      </div>

      <div className={style.mainGrid}>
        <Panel title={formatMessage({ id: 'TodayHourly' })} className={style.panelFill}>
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
          <div className={style.chartFill}>
            <Echart option={hourlyOption} />
          </div>
        </Panel>

        <div className={style.sideStack}>
          <Panel title={formatMessage({ id: 'ChannelComposition' })}>
            <div className={style.block}>
              <StackBar items={channelItems} />
              <Legend items={channelItems} />
            </div>
            {statusItems.length > 0 ? (
              <div className={style.block}>
                <div className={style.blockTitle}>{formatMessage({ id: 'StatusDistribution' })}</div>
                <StackBar items={statusItems} />
                <Legend items={statusItems} />
              </div>
            ) : null}
          </Panel>
          <Panel title={formatMessage({ id: 'PeriodCompare' })}>
            <DurationList
              items={periodItems}
              waitingLabel={formatMessage({ id: 'EmailChannel' })}
              executionLabel={formatMessage({ id: 'SMS' })}
              waitingColor={PALETTE.email}
              executionColor={PALETTE.sms}
              format={value => value.toLocaleString()}
              emptyText={formatMessage({ id: 'NoData' })}
            />
          </Panel>
        </div>
      </div>
    </>
  );
};

const RealtimeSection = createWithRemoteLoader({
  modules: ['components-thirdparty:Echart']
})(
  withLocale(({ remoteModules, apis, ajax }) => {
    const [Echart] = remoteModules;
    const { formatMessage } = useIntl();
    const { realtimeData, isConnected, lastUpdatedAt } = useRealtimeStatisticsSSE(apis?.messageManger?.statistics?.sse?.url, ajax);

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
              {formatMessage({ id: 'Today' })} {realtimeData?.date || new Date().toLocaleDateString()}
            </span>
          </div>
          <LiveBadge
            connected={isConnected}
            text={formatMessage({ id: isConnected ? 'RealtimeConnected' : 'RealtimeDisconnected' })}
            time={lastUpdatedText ? `${formatMessage({ id: 'LastUpdatedAt' })} ${lastUpdatedText}` : ''}
          />
        </div>
        {realtimeData ? (
          <RealtimeContent Echart={Echart} data={realtimeData} />
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
