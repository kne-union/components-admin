import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { Col, Row, Space, Tag } from 'antd';
import { BarChartOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card as BoxCard, ColorfulCard } from '@kne/react-box';
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
  lineSmooth,
  axisLineStyle,
  axisLabelStyle,
  splitLineStyle,
  formatDuration
} from './constants';
import useRealtimeStatisticsSSE from './useRealtimeStatisticsSSE';
import style from './dashboard.module.scss';

const HOURS_IN_DAY = 24;

const buildTodayHourlySlots = raw => {
  const slots = Array.from({ length: HOURS_IN_DAY }, (_, h) => ({
    hour: h, total: 0, hasTotalFromApi: false, byType: {}
  }));

  (raw?.hourlyTrend || []).forEach(item => {
    const h = Number(item?.hour);
    if (!Number.isFinite(h) || h < 0 || h >= HOURS_IN_DAY) return;
    slots[h].total = Number(item?.count) || 0;
    slots[h].hasTotalFromApi = true;
  });

  (raw?.hourlyTrendByType || []).forEach(item => {
    const h = Number(item?.hour);
    if (!Number.isFinite(h) || h < 0 || h >= HOURS_IN_DAY) return;
    const n = Number(item?.count) || 0;
    slots[h].byType[item.type] = (slots[h].byType[item.type] || 0) + n;
  });

  const hasByTypeHourly = Object.values(slots).some(item => Object.keys(item.byType).length > 0);
  // 兼容后端只返回 records 的场景：从 records 反推每小时按类型统计
  if (!hasByTypeHourly && Array.isArray(raw?.records) && raw.records.length > 0) {
    raw.records.forEach(record => {
      const createdAt = record?.createdAt ? new Date(record.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      const h = createdAt.getHours();
      if (!Number.isFinite(h) || h < 0 || h >= HOURS_IN_DAY) return;
      const typeKey = String(record?.type);
      slots[h].byType[typeKey] = (slots[h].byType[typeKey] || 0) + 1;
      if (!slots[h].hasTotalFromApi) {
        slots[h].total += 1;
      }
    });
  }

  return slots;
};

const hasHourlyInput = raw => {
  const a = raw?.hourlyTrend;
  const b = raw?.hourlyTrendByType;
  const r = raw?.records;
  return (
    (Array.isArray(a) && a.length > 0) ||
    (Array.isArray(b) && b.length > 0) ||
    (Array.isArray(r) && r.length > 0)
  );
};

const RealtimeSection = createWithRemoteLoader({
  modules: ['components-thirdparty:Echart', 'components-core:Enum']
})(
  withLocale(({ remoteModules, apis }) => {
    const [Echart, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const sseUrl = apis?.task?.statistics?.sse?.url;
    const { realtimeData, isConnected, lastUpdatedAt } = useRealtimeStatisticsSSE(sseUrl);

    const byStatus = realtimeData?.byStatus || {};
    const byRunnerType = realtimeData?.byRunnerType || {};
    const totalTasks = realtimeData?.totalTasks || 0;
    const successCount = Number(byStatus.success) || 0;
    const failedCount = Number(byStatus.failed) || 0;
    const runningCount = Number(byStatus.running) || 0;
    const waitingCount = Number(byStatus.waiting) || 0;
    const canceledCount = Number(byStatus.canceled) || 0;
    const manualTaskCount = Number(byRunnerType.manual) || 0;
    const manualPendingCount = useMemo(() => {
      const records = Array.isArray(realtimeData?.records) ? realtimeData.records : [];
      return records.reduce((acc, item) => {
        const isManual = String(item?.runnerType || '') === 'manual';
        const isPending = String(item?.status || '') === 'pending';
        return isManual && isPending ? acc + 1 : acc;
      }, 0);
    }, [realtimeData]);
    const manualExecutedCount = Math.max(0, manualTaskCount - manualPendingCount);
    const manualDurationDisplay = useMemo(() => {
      const manualDur = realtimeData?.todayDuration?.byRunnerType?.manual;
      if (!manualDur || typeof manualDur !== 'object') return null;
      return {
        avgWaitingTime: formatDuration(manualDur.avgWaitingTime),
        avgExecutionTime: formatDuration(manualDur.avgExecutionTime),
        avgTotalTime: formatDuration(manualDur.avgTotalTime)
      };
    }, [realtimeData]);

    const lastUpdatedShort = useMemo(() => {
      if (!lastUpdatedAt) return '';
      try {
        return new Intl.DateTimeFormat(undefined, {
          month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).format(new Date(lastUpdatedAt));
      } catch {
        return new Date(lastUpdatedAt).toLocaleTimeString();
      }
    }, [lastUpdatedAt]);

    const periodStats = useMemo(() => {
      if (!realtimeData || !hasHourlyInput(realtimeData)) return [];
      const slots = buildTodayHourlySlots(realtimeData);
      return TIME_PERIODS.map(period => {
        let total = 0;
        const periodByType = {};
        for (let h = period.start; h < period.end; h++) {
          const s = slots[h];
          total += s.total;
          Object.entries(s.byType).forEach(([type, count]) => {
            periodByType[type] = (periodByType[type] || 0) + count;
          });
        }
        return { ...period, total, byType: periodByType };
      });
    }, [realtimeData]);

    const hourlyOption = useMemo(() => {
      if (!realtimeData || !hasHourlyInput(realtimeData)) return null;

      const slots = buildTodayHourlySlots(realtimeData);
      const hours = slots.map(s => `${String(s.hour).padStart(2, '0')}:00`);

      // 收集所有出现过的 type
      const typeSet = new Set();
      slots.forEach(s => Object.keys(s.byType).forEach(t => typeSet.add(t)));
      const typeList = Array.from(typeSet);
      if (typeList.length === 0) return null;

      const typeSeries = typeList.map((type, i) => ({
        name: type,
        type: 'line',
        smooth: lineSmooth,
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: true,
        data: slots.map(s => s.byType[type] || 0),
        lineStyle: { width: 1.5, color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length] },
        itemStyle: { color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length], borderColor: '#fff', borderWidth: 1 },
        emphasis: { focus: 'series' },
        areaStyle: { color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length] + '18' }
      }));

      return {
        color: typeList.map((_, i) => TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length]),
        tooltip: tooltipStyle,
        legend: {
          ...legendCenterStyle,
          data: typeList
        },
        grid: { ...lineChartGrid, bottom: 28 },
        xAxis: {
          type: 'category', boundaryGap: false, data: hours,
          axisLine: axisLineStyle, axisTick: { show: false },
          axisLabel: { ...axisLabelStyle, fontSize: 10, interval: 1 }
        },
        yAxis: { type: 'value', ...splitLineStyle, axisLabel: axisLabelStyle, minInterval: 1, min: 0 },
        series: typeSeries
      };
    }, [realtimeData]);

    const periodCompareOption = useMemo(() => {
      const hourlyTrendByStatus = Array.isArray(realtimeData?.hourlyTrendByStatus) ? realtimeData.hourlyTrendByStatus : [];
      if (hourlyTrendByStatus.length === 0) return null;
      const labels = TIME_PERIODS.map(p => formatMessage({ id: p.id }));
      const statusKeys = ['success', 'running', 'waiting', 'canceled', 'failed'];
      const statusLabelMap = {
        success: formatMessage({ id: 'Success' }),
        running: formatMessage({ id: 'Running' }),
        waiting: formatMessage({ id: 'Waiting' }),
        canceled: formatMessage({ id: 'Canceled' }),
        failed: formatMessage({ id: 'Failed' })
      };
      const statusData = statusKeys.reduce((acc, key) => ({ ...acc, [key]: [0, 0, 0, 0] }), {});

      hourlyTrendByStatus.forEach(item => {
        const h = Number(item?.hour);
        const status = String(item?.status || '');
        const count = Number(item?.count) || 0;
        if (!Number.isFinite(h) || !statusData[status]) return;
        const periodIndex = TIME_PERIODS.findIndex(p => h >= p.start && h < p.end);
        if (periodIndex >= 0) statusData[status][periodIndex] += count;
      });

      return {
        color: statusKeys.map(key => STATUS_COLOR_MAP[key] || PALETTE.total),
        tooltip: { ...tooltipStyle, axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(148,163,184,0.15)' } } },
        legend: { ...legendCenterStyle, data: statusKeys.map(key => statusLabelMap[key]) },
        grid: { ...lineChartGrid, bottom: 20 },
        xAxis: { type: 'category', data: labels, axisLine: axisLineStyle, axisTick: { show: false }, axisLabel: { color: '#64748b', fontSize: 12 } },
        yAxis: { type: 'value', ...splitLineStyle, axisLabel: axisLabelStyle, minInterval: 1, min: 0 },
        series: statusKeys.map(key => ({
          name: statusLabelMap[key],
          type: 'bar',
          data: statusData[key],
          barMaxWidth: 32,
          barGap: '15%',
          itemStyle: { color: STATUS_COLOR_MAP[key] || PALETTE.total, borderRadius: [4, 4, 0, 0] },
          emphasis: { focus: 'series' }
        }))
      };
    }, [realtimeData, formatMessage]);

    const durationDisplay = useMemo(() => {
      const dur = realtimeData?.todayDuration;
      if (!dur) return null;
      return {
        avgWaitingTime: formatDuration(dur.avgWaitingTime),
        avgExecutionTime: formatDuration(dur.avgExecutionTime),
        avgTotalTime: formatDuration(dur.avgTotalTime)
      };
    }, [realtimeData]);

    const durationByTypeOption = useMemo(() => {
      const byType = realtimeData?.todayDuration?.byType;
      if (!byType || typeof byType !== 'object') return null;
      const entries = Object.entries(byType).filter(([, value]) => value && typeof value === 'object');
      if (entries.length === 0) return null;

      return {
        color: [PALETTE.running, PALETTE.waiting, PALETTE.total],
        tooltip: {
          ...tooltipStyle,
          axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(148,163,184,0.15)' } },
          formatter: params => {
            const title = params?.[0]?.axisValue || '';
            const lines = (params || []).map(p => `${p.marker} ${p.seriesName}: ${formatDuration(p.value)}`).join('<br/>');
            return `<div style="font-weight:600;margin-bottom:4px">${title}</div>${lines}`;
          }
        },
        legend: {
          ...legendCenterStyle,
          data: [
            formatMessage({ id: 'AvgExecutionTime' }),
            formatMessage({ id: 'AvgWaitingTime' }),
            formatMessage({ id: 'AvgTotalTime' })
          ]
        },
        grid: { ...lineChartGrid, bottom: 20 },
        xAxis: {
          type: 'category',
          data: entries.map(([type]) => type),
          axisLine: axisLineStyle,
          axisTick: { show: false },
          axisLabel: { ...axisLabelStyle, interval: 0, rotate: entries.length > 6 ? 20 : 0 }
        },
        yAxis: {
          type: 'value',
          ...splitLineStyle,
          axisLabel: { ...axisLabelStyle, formatter: value => formatDuration(value) },
          min: 0
        },
        series: [
          {
            name: formatMessage({ id: 'AvgExecutionTime' }),
            type: 'bar',
            data: entries.map(([, value]) => Number(value.avgExecutionTime) || 0),
            barMaxWidth: 28,
            itemStyle: { color: PALETTE.running, borderRadius: [4, 4, 0, 0] }
          },
          {
            name: formatMessage({ id: 'AvgWaitingTime' }),
            type: 'bar',
            data: entries.map(([, value]) => Number(value.avgWaitingTime) || 0),
            barMaxWidth: 28,
            itemStyle: { color: PALETTE.waiting, borderRadius: [4, 4, 0, 0] }
          },
          {
            name: formatMessage({ id: 'AvgTotalTime' }),
            type: 'bar',
            data: entries.map(([, value]) => Number(value.avgTotalTime) || 0),
            barMaxWidth: 28,
            itemStyle: { color: PALETTE.total, borderRadius: [4, 4, 0, 0] }
          }
        ]
      };
    }, [realtimeData, formatMessage]);

    return (
      <>
        <div className={style.realtimeHeader}>
          <div className={style.realtimeHeaderMain}>
            <h3 className={style.realtimeTitle}>{formatMessage({ id: 'RealtimeData' })}</h3>
            {realtimeData ? (
              <div className={style.realtimeSubline}>
                <strong style={{ color: '#334155', fontWeight: 600 }}>{formatMessage({ id: 'Today' })}</strong>
                {' · '}
                {formatMessage({ id: 'TotalCount' })} <strong style={{ color: PALETTE.total }}>{totalTasks}</strong>
                {' · '}
                <span style={{ color: PALETTE.success }}>{formatMessage({ id: 'Success' })}</span> <strong style={{ color: PALETTE.success }}>{successCount}</strong>
                {' · '}
                <span style={{ color: PALETTE.failed }}>{formatMessage({ id: 'Failed' })}</span> <strong style={{ color: PALETTE.failed }}>{failedCount}</strong>
                {durationDisplay && (
                  <>
                    {' · '}
                    {formatMessage({ id: 'AvgTotalTime' })} <strong>{durationDisplay.avgTotalTime}</strong>
                  </>
                )}
              </div>
            ) : (
              <div className={style.realtimeSubline}>{formatMessage({ id: isConnected ? 'WaitingForData' : 'RealtimeDisconnected' })}</div>
            )}
          </div>
          <div className={style.realtimeHeaderMeta}>
            <Tag color={isConnected ? 'green' : 'default'} style={{ margin: 0 }}>
              {formatMessage({ id: isConnected ? 'RealtimeConnected' : 'RealtimeDisconnected' })}
            </Tag>
            {lastUpdatedAt ? (
              <span className={style.realtimeTime} title={new Date(lastUpdatedAt).toLocaleString()}>
                {formatMessage({ id: 'LastUpdatedAt' })} {lastUpdatedShort}
              </span>
            ) : null}
          </div>
        </div>

        {realtimeData ? (
          <Enum moduleName="taskType">
            {taskTypeList => {
              const typeLabelMap = {};
              (taskTypeList || []).forEach(item => {
                const label = item.label || item.description || item.value;
                typeLabelMap[String(item.value)] = label;
                typeLabelMap[item.value] = label;
              });
              const getTaskTypeLabel = type => typeLabelMap[String(type)] || typeLabelMap[type] || String(type);
              const resolvedHourlyOption = hourlyOption
                ? {
                  ...hourlyOption,
                  legend: {
                    ...hourlyOption.legend,
                    data: hourlyOption.legend.data.map(name => getTaskTypeLabel(name))
                  },
                  series: hourlyOption.series.map(s => ({ ...s, name: getTaskTypeLabel(s.name) }))
                }
                : null;
              const resolvedDurationByTypeOption = durationByTypeOption
                ? {
                  ...durationByTypeOption,
                  xAxis: {
                    ...durationByTypeOption.xAxis,
                    data: durationByTypeOption.xAxis.data.map(type => getTaskTypeLabel(type))
                  }
                }
                : null;

              return (
                <>
                  <div className={style.manualExecutionPanel}>
                    <div className={style.manualExecutionHeader}>
                      <span className={style.manualExecutionTitle}>{formatMessage({ id: 'ManualExecutionStats' })}</span>
                      <strong className={style.manualExecutionValue}>{manualPendingCount}</strong>
                    </div>
                    <div className={`${style.kpiRow} ${style.kpiRowDense}`}>
                      <ColorfulCard
                        className={`${style.kpiCard} ${style.kpiCardDense} ${style.manualPendingCard}`}
                        color={PALETTE.failed}
                        icon={<ClockCircleOutlined />}
                        title={<span className={`${style.kpiValueDense} ${style.manualPendingValue}`} style={{ color: PALETTE.failed }}>{manualPendingCount}</span>}
                        description={<span className={style.kpiDescDense}>{formatMessage({ id: 'ManualPendingTasks' })}</span>}
                      />
                      <ColorfulCard
                        className={`${style.kpiCard} ${style.kpiCardDense}`}
                        color={PALETTE.success}
                        icon={<CheckCircleOutlined />}
                        title={<span className={style.kpiValueDense} style={{ color: PALETTE.success }}>{manualExecutedCount}</span>}
                        description={<span className={style.kpiDescDense}>{formatMessage({ id: 'ManualExecutedTasks' })}</span>}
                      />
                    </div>
                    {manualDurationDisplay && (
                      <div className={`${style.kpiRow} ${style.kpiRowDense} ${style.manualDurationRow}`}>
                        <ColorfulCard
                          className={`${style.kpiCard} ${style.kpiCardDense}`}
                          color={PALETTE.running}
                          icon={<ThunderboltOutlined />}
                          title={<span className={style.kpiValueDense} style={{ color: PALETTE.running }}>{manualDurationDisplay.avgExecutionTime}</span>}
                          description={<span className={style.kpiDescDense}>{formatMessage({ id: 'ManualAvgExecutionTime' })}</span>}
                        />
                        <ColorfulCard
                          className={`${style.kpiCard} ${style.kpiCardDense}`}
                          color={PALETTE.waiting}
                          icon={<ClockCircleOutlined />}
                          title={<span className={style.kpiValueDense} style={{ color: PALETTE.waiting }}>{manualDurationDisplay.avgWaitingTime}</span>}
                          description={<span className={style.kpiDescDense}>{formatMessage({ id: 'ManualAvgWaitingTime' })}</span>}
                        />
                        <ColorfulCard
                          className={`${style.kpiCard} ${style.kpiCardDense}`}
                          color={PALETTE.total}
                          icon={<BarChartOutlined />}
                          title={<span className={style.kpiValueDense} style={{ color: PALETTE.total }}>{manualDurationDisplay.avgTotalTime}</span>}
                          description={<span className={style.kpiDescDense}>{formatMessage({ id: 'ManualAvgTotalTime' })}</span>}
                        />
                      </div>
                    )}
                  </div>

                  <div className={style.realtimeGroupTitle}>{formatMessage({ id: 'RealtimeTaskOverview' })}</div>
                  <div className={`${style.kpiRow} ${style.kpiRowDense}`}>
              <ColorfulCard
                className={`${style.kpiCard} ${style.kpiCardDense}`}
                color={PALETTE.total}
                icon={<BarChartOutlined />}
                title={<span className={style.kpiValueDense} style={{ color: PALETTE.total }}>{totalTasks}</span>}
                description={<span className={style.kpiDescDense}>{formatMessage({ id: 'TodayTasks' })}</span>}
              />
              <ColorfulCard
                className={`${style.kpiCard} ${style.kpiCardDense}`}
                color={PALETTE.success}
                icon={<CheckCircleOutlined />}
                title={<span className={style.kpiValueDense} style={{ color: PALETTE.success }}>{successCount}</span>}
                description={<span className={style.kpiDescDense}>{formatMessage({ id: 'TodaySuccess' })}</span>}
              />
              <ColorfulCard
                className={`${style.kpiCard} ${style.kpiCardDense}`}
                color={PALETTE.failed}
                icon={<CloseCircleOutlined />}
                title={<span className={style.kpiValueDense} style={{ color: PALETTE.failed }}>{failedCount}</span>}
                description={<span className={style.kpiDescDense}>{formatMessage({ id: 'TodayFailed' })}</span>}
              />
              <ColorfulCard
                className={`${style.kpiCard} ${style.kpiCardDense}`}
                color={PALETTE.running}
                icon={<ThunderboltOutlined />}
                title={<span className={style.kpiValueDense} style={{ color: PALETTE.running }}>{runningCount}</span>}
                description={<span className={style.kpiDescDense}>{formatMessage({ id: 'Running' })}</span>}
              />
              <ColorfulCard
                className={`${style.kpiCard} ${style.kpiCardDense}`}
                color={PALETTE.waiting}
                icon={<ClockCircleOutlined />}
                title={<span className={style.kpiValueDense} style={{ color: PALETTE.waiting }}>{waitingCount}</span>}
                description={<span className={style.kpiDescDense}>{formatMessage({ id: 'Waiting' })}</span>}
              />
              <ColorfulCard
                className={`${style.kpiCard} ${style.kpiCardDense}`}
                color={PALETTE.canceled}
                icon={<CloseCircleOutlined />}
                title={<span className={style.kpiValueDense} style={{ color: PALETTE.canceled }}>{canceledCount}</span>}
                description={<span className={style.kpiDescDense}>{formatMessage({ id: 'Canceled' })}</span>}
              />
            </div>

                  <div className={style.realtimeSectionDivider} />
                  <div className={style.realtimeGroupTitle}>{formatMessage({ id: 'ExecutionTimeStatistics' })}</div>
                  <div className={`${style.kpiRow} ${style.kpiRowDense}`}>
                    {durationDisplay ? (
                      <>
                        <ColorfulCard
                          className={`${style.kpiCard} ${style.kpiCardDense}`}
                          color={PALETTE.running}
                          icon={<ThunderboltOutlined />}
                          title={<span className={style.kpiValueDense} style={{ color: PALETTE.running }}>{durationDisplay.avgExecutionTime}</span>}
                          description={<span className={style.kpiDescDense}>{formatMessage({ id: 'AvgExecutionTime' })}</span>}
                        />
                        <ColorfulCard
                          className={`${style.kpiCard} ${style.kpiCardDense}`}
                          color={PALETTE.waiting}
                          icon={<ClockCircleOutlined />}
                          title={<span className={style.kpiValueDense} style={{ color: PALETTE.waiting }}>{durationDisplay.avgWaitingTime}</span>}
                          description={<span className={style.kpiDescDense}>{formatMessage({ id: 'AvgWaitingTime' })}</span>}
                        />
                        <ColorfulCard
                          className={`${style.kpiCard} ${style.kpiCardDense}`}
                          color={PALETTE.total}
                          icon={<BarChartOutlined />}
                          title={<span className={style.kpiValueDense} style={{ color: PALETTE.total }}>{durationDisplay.avgTotalTime}</span>}
                          description={<span className={style.kpiDescDense}>{formatMessage({ id: 'AvgTotalTime' })}</span>}
                        />
                      </>
                    ) : (
                      <BoxCard className={style.chartCardSurface} style={{ width: '100%' }}>
                        <div className={style.emptyState}>{formatMessage({ id: 'NoData' })}</div>
                      </BoxCard>
                    )}
                  </div>

                  <BoxCard className={`${style.chartCardSurface} ${style.durationByTypeCard}`} title={formatMessage({ id: 'ExecutionTimeByTaskType' })}>
                    {resolvedDurationByTypeOption ? (
                      <Echart style={{ height: 320 }} option={resolvedDurationByTypeOption} />
                    ) : (
                      <div className={style.emptyState}>{formatMessage({ id: 'NoData' })}</div>
                    )}
                  </BoxCard>

                  <div className={style.periodStrip}>
                    {periodStats.map(period => (
                      <div key={period.id} className={style.periodStripCell}>
                        <div className={style.periodStripLabel}>
                          <Space size={6} wrap className={style.periodStripLabelInner}>
                            <Tag
                              style={{
                                margin: 0,
                                color: period.color,
                                background: `${period.color}18`,
                                borderColor: `${period.color}55`
                              }}
                            >
                              {formatMessage({ id: period.id })}
                            </Tag>
                            <Tag
                              style={{
                                margin: 0,
                                color: '#475569',
                                background: '#f1f5f9',
                                borderColor: '#e2e8f0'
                              }}
                            >
                              {String(period.start).padStart(2, '0')}:00–{String(period.end).padStart(2, '0')}:00
                            </Tag>
                          </Space>
                        </div>
                        <div className={style.periodStripValue} style={{ color: period.color }}>
                          {period.total}
                        </div>
                        <div className={style.periodStripMeta}>
                          <Space size={[6, 6]} wrap className={style.periodStripMetaInner}>
                            {Object.entries(period.byType)
                              .map(([type, count]) => ({ type, count: Number(count) || 0 }))
                              .filter(({ count }) => count > 0)
                              .map(({ type, count }, i) => {
                                const color = TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length];
                                return (
                                  <Tag
                                    key={type}
                                    style={{
                                      margin: 0,
                                      color,
                                      background: `${color}14`,
                                      borderColor: `${color}50`
                                    }}
                                  >
                                    {getTaskTypeLabel(type)}{' '}
                                    <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                                  </Tag>
                                );
                              })}
                          </Space>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Row gutter={[20, 24]} className={style.chartsRow}>
                    <Col xs={24} lg={12} className={style.chartCol}>
                      <BoxCard className={style.chartCardSurface} title={formatMessage({ id: 'PeriodCompare' })} style={{ height: '100%' }}>
                        {periodCompareOption ? (
                          <Echart style={{ height: 320 }} option={periodCompareOption} />
                        ) : (
                          <div className={style.emptyState}>{formatMessage({ id: 'NoData' })}</div>
                        )}
                      </BoxCard>
                    </Col>
                    <Col xs={24} lg={12} className={style.chartCol}>
                      <BoxCard className={style.chartCardSurface} title={formatMessage({ id: 'TodayHourlyTrend' })} style={{ height: '100%' }}>
                        {resolvedHourlyOption ? (
                          <Echart style={{ height: 320 }} option={resolvedHourlyOption} />
                        ) : (
                          <div className={style.emptyState}>{formatMessage({ id: 'NoData' })}</div>
                        )}
                      </BoxCard>
                    </Col>
                  </Row>
                </>
              );
            }}
          </Enum>
        ) : (
          <BoxCard>
            <div className={style.emptyStateLarge}>
              {isConnected ? formatMessage({ id: 'WaitingForData' }) : formatMessage({ id: 'RealtimeDisconnected' })}
            </div>
          </BoxCard>
        )}
      </>
    );
  })
);

export default RealtimeSection;
