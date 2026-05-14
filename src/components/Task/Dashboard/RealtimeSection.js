import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Row, Segmented, Space, Tag } from 'antd';
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
  formatDuration,
  pickStatisticsDurationMs,
  sanitizeStatisticsDurationMs,
  resolveDurationMsForDashboard,
  sortTaskTypeKeys
} from './constants';
import useRealtimeStatisticsSSE from './useRealtimeStatisticsSSE';
import style from './dashboard.module.scss';

const HOURS_IN_DAY = 24;

/** 取第一个有效非负整数；用于统计类字段的多来源兼容 */
const pickNonNegativeInt = (...candidates) => {
  for (const v of candidates) {
    if (v === undefined || v === null) continue;
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return Math.trunc(n);
  }
  return 0;
};

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

  return slots;
};

const RealtimeSection = createWithRemoteLoader({
  modules: ['components-thirdparty:Echart', 'components-core:Enum']
})(
  withLocale(({ remoteModules, apis, baseUrl }) => {
    const [Echart, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const navigate = useNavigate();
    const myTaskPath = useMemo(() => {
      if (baseUrl == null || baseUrl === '') return null;
      const prefix = String(baseUrl).replace(/\/$/, '');
      return `${prefix}/task/my`;
    }, [baseUrl]);
    const goMyTasks = useCallback(() => {
      if (myTaskPath) navigate(myTaskPath);
    }, [navigate, myTaskPath]);
    const manualPanelKeyHandler = useCallback(
      e => {
        if (!myTaskPath) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goMyTasks();
        }
      },
      [goMyTasks, myTaskPath]
    );
    const sseUrl = apis?.task?.statistics?.sse?.url;
    const { realtimeData, isConnected, lastUpdatedAt } = useRealtimeStatisticsSSE(sseUrl);
    /** 执行时间统计三张卡 + 按类型耗时图：全部 | 手动 | 自动（todayDuration / byTypeByRunnerType） */
    const [durationByTypeRunnerMode, setDurationByTypeRunnerMode] = useState('all');

    const byStatus = realtimeData?.byStatus || {};
    const byRunnerType = realtimeData?.byRunnerType || {};
    const totalTasks = realtimeData?.totalTasks || 0;
    const successCount = Number(byStatus.success) || 0;
    const failedCount = Number(byStatus.failed) || 0;
    const runningCount = Number(byStatus.running) || 0;
    const waitingCount = Number(byStatus.waiting) || 0;
    const canceledCount = Number(byStatus.canceled) || 0;
    const manualRt = realtimeData?.runnerTypeStats?.manual;
    const hasManualRunnerStats = manualRt && typeof manualRt === 'object';
    const manualTaskCount = hasManualRunnerStats
      ? Number(manualRt.total) || 0
      : Number(byRunnerType.manual) || 0;
    /**
     * 手动「等待操作」：**主展示条数**（waitingByRunnerType.manual 等）；次展示队列内
     * 最长等待（`waitingQueueMaxWaitMsByRunnerType.manual`，当前时间 − createdAt）。
     */
    const manualPendingCount = pickNonNegativeInt(
      realtimeData?.waitingByRunnerType?.manual,
      manualRt?.waiting,
      manualRt?.waitingCount
    );
    /**
     * 手动「当日完成」：**主展示条数**（completedToday.manual）；次展示当日完成任务的
     * 创建→完成耗时之和（`completedTodayTotalDurationMsByRunnerType.manual`）。
     */
    const manualExecutedCount = pickNonNegativeInt(realtimeData?.completedToday?.manual);

    const manualPendingMaxWaitDisplay = useMemo(() => {
      if (manualPendingCount <= 0) return '—';
      const ms = resolveDurationMsForDashboard(realtimeData?.waitingQueueMaxWaitMsByRunnerType?.manual);
      return ms != null ? formatDuration(ms) : '—';
    }, [realtimeData, manualPendingCount]);

    const manualCompletedTotalDurationDisplay = useMemo(() => {
      if (manualExecutedCount <= 0) return '—';
      const ms = resolveDurationMsForDashboard(realtimeData?.completedTodayTotalDurationMsByRunnerType?.manual);
      return ms != null ? formatDuration(ms) : '—';
    }, [realtimeData, manualExecutedCount]);

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
      if (!realtimeData) return [];
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

    /** 与「今日每小时趋势」series 顺序一致；下方时段条按此列表取色，避免同色不同 type */
    const todayHourlyTaskTypeOrder = useMemo(() => {
      if (!realtimeData) return [];
      const slots = buildTodayHourlySlots(realtimeData);
      const typeSet = new Set();
      slots.forEach(s => Object.keys(s.byType).forEach(t => typeSet.add(t)));
      return sortTaskTypeKeys(typeSet);
    }, [realtimeData]);

    const hourlyOption = useMemo(() => {
      if (!realtimeData) return null;

      const slots = buildTodayHourlySlots(realtimeData);
      const hours = slots.map(s => `${String(s.hour).padStart(2, '0')}:00`);

      const typeList = todayHourlyTaskTypeOrder;

      if (typeList.length === 0) {
        const totalLabel = formatMessage({ id: 'TotalCount' });
        return {
          color: [PALETTE.total],
          tooltip: tooltipStyle,
          legend: { ...legendCenterStyle, data: [totalLabel] },
          grid: { ...lineChartGrid, bottom: 28 },
          xAxis: {
            type: 'category', boundaryGap: false, data: hours,
            axisLine: axisLineStyle, axisTick: { show: false },
            axisLabel: { ...axisLabelStyle, fontSize: 10, interval: 1 }
          },
          yAxis: { type: 'value', ...splitLineStyle, axisLabel: axisLabelStyle, minInterval: 1, min: 0 },
          series: [
            {
              name: totalLabel,
              type: 'line',
              smooth: lineSmooth,
              symbol: 'circle',
              symbolSize: 4,
              showSymbol: true,
              data: slots.map(s => s.total),
              lineStyle: { width: 1.5, color: PALETTE.total },
              itemStyle: { color: PALETTE.total, borderColor: '#fff', borderWidth: 1 },
              emphasis: { focus: 'series' },
              areaStyle: { color: `${PALETTE.total}18` }
            }
          ]
        };
      }

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
    }, [realtimeData, formatMessage, todayHourlyTaskTypeOrder]);

    const periodCompareOption = useMemo(() => {
      const hourlyTrendByStatus = Array.isArray(realtimeData?.hourlyTrendByStatus) ? realtimeData.hourlyTrendByStatus : [];
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

      if (durationByTypeRunnerMode === 'all') {
        return {
          avgWaitingTime: formatDuration(pickStatisticsDurationMs(dur, 'avgWaitingTime')),
          avgExecutionTime: formatDuration(pickStatisticsDurationMs(dur, 'avgExecutionTime')),
          avgTotalTime: formatDuration(pickStatisticsDurationMs(dur, 'avgTotalTime'))
        };
      }

      const source =
        dur.byRunnerType && typeof dur.byRunnerType === 'object'
          ? dur.byRunnerType[durationByTypeRunnerMode]
          : undefined;
      const pickSlice = field => formatDuration(pickStatisticsDurationMs(source, field, []));

      return {
        avgWaitingTime: pickSlice('avgWaitingTime'),
        avgExecutionTime: pickSlice('avgExecutionTime'),
        avgTotalTime: pickSlice('avgTotalTime')
      };
    }, [realtimeData, durationByTypeRunnerMode]);

    const durationByTypeOption = useMemo(() => {
      if (!realtimeData) return null;

      const todayDur = realtimeData?.todayDuration;
      const byRunnerSplit = todayDur?.byTypeByRunnerType;
      let durationByType = {};
      let countByType =
        realtimeData.byType && typeof realtimeData.byType === 'object' ? realtimeData.byType : {};

      if (durationByTypeRunnerMode === 'manual') {
        const m = byRunnerSplit?.manual;
        if (m && typeof m === 'object') {
          durationByType = m;
          countByType = Object.fromEntries(
            Object.keys(durationByType).map(k => {
              const d = durationByType[k];
              const c = d && typeof d === 'object' ? Number(d.count) || 0 : 0;
              return [k, c];
            })
          );
        } else {
          durationByType = {};
          countByType = {};
        }
      } else if (durationByTypeRunnerMode === 'system') {
        const s = byRunnerSplit?.system;
        if (s && typeof s === 'object') {
          durationByType = s;
          countByType = Object.fromEntries(
            Object.keys(durationByType).map(k => {
              const d = durationByType[k];
              const c = d && typeof d === 'object' ? Number(d.count) || 0 : 0;
              return [k, c];
            })
          );
        } else {
          durationByType = {};
          countByType = {};
        }
      } else {
        durationByType =
          todayDur && typeof todayDur === 'object' && todayDur.byType && typeof todayDur.byType === 'object'
            ? todayDur.byType
            : {};
        countByType =
          realtimeData.byType && typeof realtimeData.byType === 'object' ? realtimeData.byType : {};
      }

      const typeSet = new Set([
        ...Object.keys(countByType).filter(k => (Number(countByType[k]) || 0) > 0),
        ...Object.keys(durationByType).filter(k => durationByType[k] && typeof durationByType[k] === 'object')
      ]);
      const noDataLabel = formatMessage({ id: 'NoData' });
      if (typeSet.size === 0) {
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
            data: [noDataLabel],
            axisLine: axisLineStyle,
            axisTick: { show: false },
            axisLabel: axisLabelStyle
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
              data: [0],
              barMaxWidth: 28,
              itemStyle: { color: PALETTE.running, borderRadius: [4, 4, 0, 0] }
            },
            {
              name: formatMessage({ id: 'AvgWaitingTime' }),
              type: 'bar',
              data: [0],
              barMaxWidth: 28,
              itemStyle: { color: PALETTE.waiting, borderRadius: [4, 4, 0, 0] }
            },
            {
              name: formatMessage({ id: 'AvgTotalTime' }),
              type: 'bar',
              data: [0],
              barMaxWidth: 28,
              itemStyle: { color: PALETTE.total, borderRadius: [4, 4, 0, 0] }
            }
          ]
        };
      }

      const entries = Array.from(typeSet)
        .map(type => {
          const d = durationByType[type];
          if (d && typeof d === 'object') return [type, d];
          const c = Number(countByType[type]) || 0;
          return [type, { count: c }];
        })
        .sort((a, b) => {
          const ca = Number(a[1]?.count) || Number(countByType[a[0]]) || 0;
          const cb = Number(b[1]?.count) || Number(countByType[b[0]]) || 0;
          return cb - ca;
        });

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
            data: entries.map(([, value]) => sanitizeStatisticsDurationMs(value.avgExecutionTime) ?? 0),
            barMaxWidth: 28,
            itemStyle: { color: PALETTE.running, borderRadius: [4, 4, 0, 0] }
          },
          {
            name: formatMessage({ id: 'AvgWaitingTime' }),
            type: 'bar',
            data: entries.map(([, value]) => sanitizeStatisticsDurationMs(value.avgWaitingTime) ?? 0),
            barMaxWidth: 28,
            itemStyle: { color: PALETTE.waiting, borderRadius: [4, 4, 0, 0] }
          },
          {
            name: formatMessage({ id: 'AvgTotalTime' }),
            type: 'bar',
            data: entries.map(([, value]) => sanitizeStatisticsDurationMs(value.avgTotalTime) ?? 0),
            barMaxWidth: 28,
            itemStyle: { color: PALETTE.total, borderRadius: [4, 4, 0, 0] }
          }
        ]
      };
    }, [realtimeData, formatMessage, durationByTypeRunnerMode]);

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
                  <div
                    className={`${style.manualExecutionPanel}${myTaskPath ? ` ${style.manualExecutionPanelClickable}` : ''}`}
                    onClick={myTaskPath ? goMyTasks : undefined}
                    onKeyDown={myTaskPath ? manualPanelKeyHandler : undefined}
                    role={myTaskPath ? 'button' : undefined}
                    tabIndex={myTaskPath ? 0 : undefined}
                    title={myTaskPath ? formatMessage({ id: 'ManualExecutionGoMyTaskTitle' }) : undefined}
                  >
                    <div className={style.manualExecutionHeader}>
                      <span className={style.manualExecutionTitle}>{formatMessage({ id: 'ManualExecutionStats' })}</span>
                    </div>
                    <div className={`${style.kpiRow} ${style.kpiRowDense}`}>
                      <ColorfulCard
                        className={`${style.kpiCard} ${style.kpiCardDense} ${style.manualPendingCard} ${style.manualKpiCard}`}
                        color={PALETTE.failed}
                        icon={<ClockCircleOutlined />}
                        style={{ textAlign: 'left' }}
                        title={<span className={style.kpiValueDense} style={{ color: PALETTE.failed }}>{manualPendingCount}</span>}
                        description={
                          <div className={style.kpiManualCardDesc}>
                            <span className={style.kpiManualCardPurpose}>{formatMessage({ id: 'ManualPendingTasks' })}</span>
                            <div className={`${style.manualKpiTimeBlock} ${style.manualKpiTimeBlockPending}`}>
                              <span className={style.manualKpiTimeLabel}>{formatMessage({ id: 'ManualPendingMaxWaitLabel' })}</span>
                              <span className={style.manualKpiTimeValue} style={{ color: PALETTE.failed }}>
                                {manualPendingMaxWaitDisplay}
                              </span>
                            </div>
                          </div>
                        }
                      />
                      <ColorfulCard
                        className={`${style.kpiCard} ${style.kpiCardDense} ${style.manualKpiCard}`}
                        color={PALETTE.success}
                        icon={<CheckCircleOutlined />}
                        style={{ textAlign: 'left' }}
                        title={<span className={style.kpiValueDense} style={{ color: PALETTE.success }}>{manualExecutedCount}</span>}
                        description={
                          <div className={style.kpiManualCardDesc}>
                            <span className={style.kpiManualCardPurpose}>{formatMessage({ id: 'ManualExecutedTasks' })}</span>
                            <div className={`${style.manualKpiTimeBlock} ${style.manualKpiTimeBlockDone}`}>
                              <span className={style.manualKpiTimeLabel}>{formatMessage({ id: 'ManualCompletedTotalDurationLabel' })}</span>
                              <span className={style.manualKpiTimeValue} style={{ color: PALETTE.success }}>
                                {manualCompletedTotalDurationDisplay}
                              </span>
                            </div>
                          </div>
                        }
                      />
                    </div>
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
                  <div className={style.executionTimeStatHead}>
                    <span className={style.realtimeGroupTitle}>{formatMessage({ id: 'ExecutionTimeStatistics' })}</span>
                    <Segmented
                      className={style.durationByTypeRunnerSegmented}
                      size="small"
                      value={durationByTypeRunnerMode}
                      onChange={setDurationByTypeRunnerMode}
                      options={[
                        { label: formatMessage({ id: 'DurationByTypeRunnerAll' }), value: 'all' },
                        { label: formatMessage({ id: 'DurationByTypeRunnerManual' }), value: 'manual' },
                        { label: formatMessage({ id: 'DurationByTypeRunnerSystem' }), value: 'system' }
                      ]}
                    />
                  </div>
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

                  <BoxCard
                    className={`${style.chartCardSurface} ${style.durationByTypeCard}`}
                    title={formatMessage({ id: 'ExecutionTimeByTaskType' })}
                  >
                    <Echart style={{ height: 320 }} option={resolvedDurationByTypeOption} />
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
                            {sortTaskTypeKeys(
                              Object.entries(period.byType)
                                .filter(([, c]) => (Number(c) || 0) > 0)
                                .map(([type]) => type)
                            ).map(type => {
                              const count = Number(period.byType[type]) || 0;
                              const ci = todayHourlyTaskTypeOrder.indexOf(type);
                              const color =
                                TASK_TYPE_COLOR_MAP[
                                  (ci >= 0 ? ci : 0) % TASK_TYPE_COLOR_MAP.length
                                ];
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
                        <Echart style={{ height: 320 }} option={periodCompareOption} />
                      </BoxCard>
                    </Col>
                    <Col xs={24} lg={12} className={style.chartCol}>
                      <BoxCard className={style.chartCardSurface} title={formatMessage({ id: 'TodayHourlyTrend' })} style={{ height: '100%' }}>
                        <Echart style={{ height: 320 }} option={resolvedHourlyOption} />
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
