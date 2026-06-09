import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useState, useRef } from 'react';
import { Button, Col, Row, Select, Space, Segmented, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Card as BoxCard } from '@kne/react-box';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import {
  PALETTE, RANGE_OPTIONS, TASK_STATUS_LIST, STATUS_COLOR_MAP, TASK_TYPE_COLOR_MAP,
  tooltipStyle, legendCenterStyle,
  lineChartGrid, lineChartGridWithRotatedLabels, lineSmooth,
  axisLineStyle, axisLabelStyle, splitLineStyle, formatDuration, sanitizeStatisticsDurationMs
} from './constants';
import SectionHeader from './SectionHeader';
import { getClientIanaTimezone } from '../utils';
import style from './dashboard.module.scss';

const RANGE_DAY_COUNT = { '7d': 7, '1m': 30, '3m': 90, '1y': 365 };
const RANGE_AXIS_UNIT = { '7d': 'day', '1m': 'month', '3m': 'month', '1y': 'year' };
const RANGE_MONTH_COUNT = { '1m': 1, '3m': 3 };

/** 每小时趋势「按状态」折线：避免 running 使用琥珀色易与其它图表橙色混淆 */
const HOURLY_STATUS_LINE_COLOR_MAP = {
  ...STATUS_COLOR_MAP,
  running: '#7c3aed'
};

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
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      months.push(`${y}-${m}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }

  const days = RANGE_DAY_COUNT[rangeKey] || 7;
  const dates = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
};

const buildRangeDateSet = rangeKey => {
  const days = RANGE_DAY_COUNT[rangeKey] || 7;
  const dates = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return new Set(dates);
};

const buildBucketedDurationRows = ({ rangeKey, durationTrend, runnerType, selectedTypes = [] }) => {
  const axisKeys = durationTrend.length > 0 ? null : buildLocalAxisForRange(rangeKey);
  const axisUnit = getAxisUnit(rangeKey);
  const bucketMap = {};
  const typeFilters = selectedTypes.map(String).filter(Boolean);

  if (axisKeys) {
    axisKeys.forEach(date => {
      bucketMap[date] = { date, waitingSum: 0, executionSum: 0, weight: 0 };
    });
  }

  durationTrend.forEach(item => {
    const date = formatAxisKey(item.date, axisUnit);
    if (!bucketMap[date]) bucketMap[date] = { date, waitingSum: 0, executionSum: 0, weight: 0 };

    const byTypeForRunner = item?.byTypeByRunnerType?.[runnerType];
    const durationItems = typeFilters.length > 0
      ? typeFilters.map(type => byTypeForRunner?.[type]).filter(Boolean)
      : [item?.byRunnerType?.[runnerType] || null].filter(Boolean);

    durationItems.forEach(durationItem => {
      const avgWaitingTime = Number(durationItem?.avgWaitingTime) || 0;
      const avgExecutionTime = Number(durationItem?.avgExecutionTime) || 0;
      const count = Number(durationItem?.count) || 0;
      const weight = count > 0 ? count : avgWaitingTime > 0 || avgExecutionTime > 0 ? 1 : 0;

      bucketMap[date].waitingSum += avgWaitingTime * weight;
      bucketMap[date].executionSum += avgExecutionTime * weight;
      bucketMap[date].weight += weight;
    });
  });

  return Object.values(bucketMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(item => ({
      date: item.date,
      avgWaitingTime: item.weight > 0 ? item.waitingSum / item.weight : 0,
      avgExecutionTime: item.weight > 0 ? item.executionSum / item.weight : 0
    }));
};

const getDurationTaskTypesByRunner = (durationTrend, runnerType) => {
  const typeSet = new Set();
  durationTrend.forEach(item => {
    Object.keys(item?.byTypeByRunnerType?.[runnerType] || {}).forEach(type => {
      typeSet.add(String(type));
    });
  });
  return Array.from(typeSet).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
};

const buildEmptyHorizontalBarOption = (placeholder, splitLineStyle, axisLineStyle, axisLabelStyle) => ({
  tooltip: { show: false },
  grid: { left: 6, right: 28, top: 10, bottom: 10, containLabel: true },
  xAxis: {
    type: 'value',
    max: 1,
    min: 0,
    splitLine: splitLineStyle,
    axisLine: { show: false },
    axisLabel: axisLabelStyle,
    axisTick: { show: false }
  },
  yAxis: {
    type: 'category',
    data: [placeholder],
    axisLine: axisLineStyle,
    axisTick: { show: false },
    axisLabel: { ...axisLabelStyle, fontSize: 11 }
  },
  series: [
    {
      type: 'bar',
      data: [{ value: 0, itemStyle: { color: '#e2e8f0', borderRadius: [0, 6, 6, 0] } }],
      barMaxWidth: 26,
      label: { show: false }
    }
  ]
});

const HistorySection = createWithRemoteLoader({
  modules: ['components-thirdparty:Echart', 'components-core:Enum']
})(
  withLocale(({ remoteModules, apis }) => {
    const [Echart, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const [range, setRange] = useState('7d');
    /** 历史每小时趋势：按任务类型 | 按任务状态 */
    const [hourlyHistoryDim, setHourlyHistoryDim] = useState('type');
    const [manualDurationTypes, setManualDurationTypes] = useState([]);
    const [systemDurationTypes, setSystemDurationTypes] = useState([]);
    const reloadRef = useRef(() => {});

    return (
      <>
        <SectionHeader
          title={formatMessage({ id: 'HistoricalData' })}
          extra={
            <Space>
              <Segmented
                options={RANGE_OPTIONS.map(r => ({
                  label: formatMessage({ id: `Range_${r}` }),
                  value: r
                }))}
                value={range}
                onChange={setRange}
              />
              <Button type="link" icon={<ReloadOutlined />} onClick={() => reloadRef.current()}>
                {formatMessage({ id: 'Refresh' })}
              </Button>
            </Space>
          }
        />

        <Fetch
          {...Object.assign({}, apis.task.statistics.getOverview, {
            params: { range, timezone: getClientIanaTimezone() }
          })}
          render={({ data, reload }) => {
            reloadRef.current = reload;

            const byStatus = data?.byStatus || {};
            const byType = data?.byType || {};

            // 趋势折线图（按任务类型分线）
            const trendOption = (() => {
              const recentTrend = data?.recentTrend || [];
              const recentTrendByType = data?.recentTrendByType || [];
              const axisUnit = getAxisUnit(range);
              const axisDates = recentTrend.length > 0 ? null : buildLocalAxisForRange(range);

              const dateMap = {};
              if (recentTrend.length > 0) {
                recentTrend.forEach(item => {
                  const date = formatAxisKey(item.date, axisUnit);
                  if (!dateMap[date]) {
                    dateMap[date] = { date, total: 0 };
                  }
                  dateMap[date].total += Number(item.count) || 0;
                });
              } else {
                axisDates.forEach(d => {
                  dateMap[d] = { date: d, total: 0 };
                });
              }
              recentTrendByType.forEach(item => {
                const date = formatAxisKey(item.date, axisUnit);
                if (!dateMap[date]) {
                  dateMap[date] = { date, total: 0 };
                }
                dateMap[date][item.type] = (dateMap[date][item.type] || 0) + (Number(item.count) || 0);
              });

              const sorted = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
              const dates = sorted.map(item => item.date);
              const totals = sorted.map(item => item.total);
              const manyPoints = dates.length > 14;

              const typeSet = new Set();
              recentTrendByType.forEach(item => typeSet.add(item.type));
              const typeList = Array.from(typeSet);

              const typeLines = typeList.map((type, i) => ({
                name: type,
                type: 'line',
                smooth: lineSmooth,
                symbol: 'circle',
                symbolSize: 4,
                data: sorted.map(item => item[type] || 0),
                lineStyle: { width: 1.5, color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length] },
                itemStyle: { color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length], borderColor: '#fff', borderWidth: 1 },
                emphasis: { focus: 'series' },
                areaStyle: { color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length] + '12' }
              }));

              return {
                color: [PALETTE.total, ...typeList.map((_, i) => TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length])],
                tooltip: tooltipStyle,
                legend: {
                  ...legendCenterStyle,
                  data: [formatMessage({ id: 'TotalCount' }), ...typeList]
                },
                grid: manyPoints ? lineChartGridWithRotatedLabels : lineChartGrid,
                xAxis: {
                  type: 'category', boundaryGap: false, data: dates,
                  axisLine: axisLineStyle, axisTick: { show: false },
                  axisLabel: { ...axisLabelStyle, fontSize: 11, rotate: manyPoints ? 28 : 0, hideOverlap: true }
                },
                yAxis: { type: 'value', ...splitLineStyle, axisLabel: axisLabelStyle, minInterval: 1 },
                series: [
                  {
                    name: formatMessage({ id: 'TotalCount' }), type: 'line', smooth: lineSmooth,
                    symbol: 'circle', symbolSize: 6, data: totals,
                    lineStyle: { width: 2.5, color: PALETTE.total },
                    itemStyle: { color: PALETTE.total, borderColor: '#fff', borderWidth: 2 },
                    emphasis: { focus: 'series' },
                    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.18)' }, { offset: 1, color: 'rgba(59,130,246,0.02)' }] } }
                  },
                  ...typeLines
                ]
              };
            })();

            // 历史区块顶部：状态 / 类型占比（标签 + 横向 bar，与下方饼图数据源一致）
            const statusEntries = TASK_STATUS_LIST.map(status => ({
              status,
              count: Number(byStatus[status]) || 0
            })).filter(({ count }) => count > 0);
            const statusTotal = statusEntries.reduce((sum, { count }) => sum + count, 0);
            const statusDistItems = statusEntries
              .map(({ status, count }) => ({
                key: status,
                label: formatMessage({ id: status.charAt(0).toUpperCase() + status.slice(1) }),
                value: count,
                color: STATUS_COLOR_MAP[status]
              }))
              .sort((a, b) => b.value - a.value);

            const statusHBarOption =
              statusDistItems.length > 0
                ? {
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(148,163,184,0.12)' } },
                    backgroundColor: 'rgba(255,255,255,0.96)',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    textStyle: { color: '#334155', fontSize: 12 },
                    formatter: params => {
                      const p = params[0];
                      return `${p.marker} ${p.name}: ${p.value}`;
                    }
                  },
                  grid: { left: 6, right: 28, top: 6, bottom: 6, containLabel: true },
                  xAxis: {
                    type: 'value',
                    minInterval: 1,
                    splitLine: splitLineStyle,
                    axisLine: { show: false },
                    axisLabel: axisLabelStyle,
                    axisTick: { show: false }
                  },
                  yAxis: {
                    type: 'category',
                    data: statusDistItems.map(d => d.label),
                    axisLine: axisLineStyle,
                    axisTick: { show: false },
                    axisLabel: { ...axisLabelStyle, fontSize: 11 }
                  },
                  series: [
                    {
                      type: 'bar',
                      data: statusDistItems.map(d => ({
                        value: d.value,
                        itemStyle: { color: d.color, borderRadius: [0, 6, 6, 0] }
                      })),
                      barMaxWidth: 26,
                      label: { show: true, position: 'right', color: '#475569', fontSize: 11 }
                    }
                  ]
                }
                : buildEmptyHorizontalBarOption(formatMessage({ id: 'NoData' }), splitLineStyle, axisLineStyle, axisLabelStyle);

            const typeEntries = Object.entries(byType)
              .map(([type, count]) => ({ type: String(type), count: Number(count) || 0 }))
              .filter(({ count }) => count > 0)
              .sort((a, b) => b.count - a.count);
            const typeTotal = typeEntries.reduce((sum, { count }) => sum + count, 0);

            const durationTrend = data?.durationTrend || [];
            const manualDurationTaskTypes = getDurationTaskTypesByRunner(durationTrend, 'manual');
            const systemDurationTaskTypes = getDurationTaskTypesByRunner(durationTrend, 'system');
            const effectiveManualDurationTypes = manualDurationTypes.filter(type =>
              manualDurationTaskTypes.includes(String(type))
            );
            const effectiveSystemDurationTypes = systemDurationTypes.filter(type =>
              systemDurationTaskTypes.includes(String(type))
            );

            const buildWaitExecDurationOption = rows => {
              const dates = rows.map(item => item.date);
              const avgWait = rows.map(item => sanitizeStatisticsDurationMs(item.avgWaitingTime) ?? 0);
              const avgExec = rows.map(item => sanitizeStatisticsDurationMs(item.avgExecutionTime) ?? 0);
              const manyPoints = dates.length > 14;
              return {
                color: [PALETTE.waiting, PALETTE.running],
                tooltip: {
                  ...tooltipStyle,
                  formatter: params => {
                    const title = params[0]?.axisValue || '';
                    const lines = params
                      .map(p => `${p.marker} ${p.seriesName}: ${formatDuration(p.value)}`)
                      .join('<br/>');
                    return `<div style="font-weight:600;margin-bottom:4px">${title}</div>${lines}`;
                  }
                },
                legend: {
                  ...legendCenterStyle,
                  data: [formatMessage({ id: 'AvgWaitingTime' }), formatMessage({ id: 'AvgExecutionTime' })]
                },
                grid: manyPoints ? lineChartGridWithRotatedLabels : lineChartGrid,
                xAxis: {
                  type: 'category',
                  boundaryGap: false,
                  data: dates,
                  axisLine: axisLineStyle,
                  axisTick: { show: false },
                  axisLabel: { ...axisLabelStyle, fontSize: 11, rotate: manyPoints ? 28 : 0, hideOverlap: true }
                },
                yAxis: {
                  type: 'value',
                  ...splitLineStyle,
                  axisLabel: { ...axisLabelStyle, formatter: v => formatDuration(v) }
                },
                series: [
                  {
                    name: formatMessage({ id: 'AvgWaitingTime' }),
                    type: 'line',
                    smooth: lineSmooth,
                    symbol: 'circle',
                    symbolSize: 4,
                    data: avgWait,
                    lineStyle: { width: 1.5, color: PALETTE.waiting },
                    itemStyle: { color: PALETTE.waiting }
                  },
                  {
                    name: formatMessage({ id: 'AvgExecutionTime' }),
                    type: 'line',
                    smooth: lineSmooth,
                    symbol: 'circle',
                    symbolSize: 4,
                    data: avgExec,
                    lineStyle: { width: 1.5, color: PALETTE.running },
                    itemStyle: { color: PALETTE.running }
                  }
                ]
              };
            };

            const manualDurationRows = buildBucketedDurationRows({
              rangeKey: range,
              durationTrend,
              runnerType: 'manual',
              selectedTypes: effectiveManualDurationTypes
            });
            const systemDurationRows = buildBucketedDurationRows({
              rangeKey: range,
              durationTrend,
              runnerType: 'system',
              selectedTypes: effectiveSystemDurationTypes
            });
            const manualDurationOption = buildWaitExecDurationOption(manualDurationRows);
            const systemDurationOption = buildWaitExecDurationOption(systemDurationRows);

            return (
              <>
                <div className={style.historyOverviewMeta}>
                  <div className={style.historyTotalHighlight}>
                    <span className={style.historyTotalHighlightLabel}>
                      {formatMessage({ id: 'TotalTasks' })}
                    </span>
                    <span className={style.historyTotalHighlightValue} style={{ color: PALETTE.total }}>
                      {(data?.totalTasks ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className={style.historyBarsCombined}>
                  <div className={style.historyBarRow}>
                    <div className={style.historyBarRowLabel}>{formatMessage({ id: 'StatusDistribution' })}</div>
                    <div className={style.historyBarRowSplit}>
                      <div className={style.historySplitLegendBar}>
                        {statusDistItems.length > 0 ? (
                          <div className={style.historySplitTagRow}>
                            <Space wrap className={style.historySplitTagInner}>
                              {statusDistItems.map(d => (
                                <Tag
                                  key={d.key}
                                  style={{
                                    margin: 0,
                                    color: d.color,
                                    background: `${d.color}18`,
                                    borderColor: `${d.color}55`
                                  }}
                                >
                                  {d.label}{' '}
                                  <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{d.value}</strong>
                                  {statusTotal > 0
                                    ? ` (${Math.round((d.value / statusTotal) * 100)}%)`
                                    : ''}
                                </Tag>
                              ))}
                            </Space>
                          </div>
                        ) : null}
                        <div className={style.historySplitBar}>
                          <Echart
                            style={{ height: Math.max(112, Math.max(statusDistItems.length, 1) * 28) }}
                            option={statusHBarOption}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={style.historyBarRowDivider} />
                  <Enum moduleName="taskType">
                    {taskTypeList => {
                      const typeLabelMap = {};
                      (taskTypeList || []).forEach(item => {
                        const v = item.value;
                        const label = item.label || item.description || String(v);
                        typeLabelMap[v] = label;
                        typeLabelMap[String(v)] = label;
                      });
                      const typeDistItems = typeEntries.map(({ type, count }, i) => ({
                        key: type,
                        label: typeLabelMap[type] ?? type,
                        value: count,
                        color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length]
                      }));
                      const typeHBarOption =
                        typeDistItems.length > 0
                          ? {
                            tooltip: {
                              trigger: 'axis',
                              axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(148,163,184,0.12)' } },
                              backgroundColor: 'rgba(255,255,255,0.96)',
                              borderColor: '#e2e8f0',
                              borderWidth: 1,
                              textStyle: { color: '#334155', fontSize: 12 },
                              formatter: params => {
                                const p = params[0];
                                return `${p.marker} ${p.name}: ${p.value}`;
                              }
                            },
                            grid: { left: 6, right: 28, top: 6, bottom: 6, containLabel: true },
                            xAxis: {
                              type: 'value',
                              minInterval: 1,
                              splitLine: splitLineStyle,
                              axisLine: { show: false },
                              axisLabel: axisLabelStyle,
                              axisTick: { show: false }
                            },
                            yAxis: {
                              type: 'category',
                              data: typeDistItems.map(d => d.label),
                              axisLine: axisLineStyle,
                              axisTick: { show: false },
                              axisLabel: { ...axisLabelStyle, fontSize: 11 }
                            },
                            series: [
                              {
                                type: 'bar',
                                data: typeDistItems.map(d => ({
                                  value: d.value,
                                  itemStyle: { color: d.color, borderRadius: [0, 6, 6, 0] }
                                })),
                                barMaxWidth: 26,
                                label: { show: true, position: 'right', color: '#475569', fontSize: 11 }
                              }
                            ]
                          }
                          : buildEmptyHorizontalBarOption(formatMessage({ id: 'NoData' }), splitLineStyle, axisLineStyle, axisLabelStyle);
                      return (
                        <div className={style.historyBarRow}>
                          <div className={style.historyBarRowLabel}>
                            {formatMessage({ id: 'TaskTypeDistribution' })}
                          </div>
                          <div className={style.historyBarRowSplit}>
                            <div className={style.historySplitLegendBar}>
                              {typeDistItems.length > 0 ? (
                                <div className={style.historySplitTagRow}>
                                  <Space wrap className={style.historySplitTagInner}>
                                    {typeDistItems.map(d => (
                                      <Tag
                                        key={d.key}
                                        style={{
                                          margin: 0,
                                          color: d.color,
                                          background: `${d.color}18`,
                                          borderColor: `${d.color}50`
                                        }}
                                      >
                                        {d.label}{' '}
                                        <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{d.value}</strong>
                                        {typeTotal > 0
                                          ? ` (${Math.round((d.value / typeTotal) * 100)}%)`
                                          : ''}
                                      </Tag>
                                    ))}
                                  </Space>
                                </div>
                              ) : null}
                              <div className={style.historySplitBar}>
                                <Echart
                                  style={{ height: Math.max(112, Math.max(typeDistItems.length, 1) * 28) }}
                                  option={typeHBarOption}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  </Enum>
                </div>

                <BoxCard className={`${style.chartCardSurface} ${style.historyTrendCard} ${style.historyTrendTightTop}`}>
                  <Enum moduleName="taskType">
                    {taskTypeList => {
                      const typeLabelMap = {};
                      (taskTypeList || []).forEach(item => {
                        typeLabelMap[item.value] = item.label || item.description || item.value;
                      });
                      const resolvedOption = {
                        ...trendOption,
                        legend: {
                          ...trendOption.legend,
                          data: [
                            trendOption.legend.data[0],
                            ...trendOption.legend.data.slice(1).map(name => typeLabelMap[name] || name)
                          ]
                        },
                        series: trendOption.series.map((s, i) => {
                          if (i === 0) return s;
                          return { ...s, name: typeLabelMap[s.name] || s.name };
                        })
                      };
                      return <Echart style={{ height: 380 }} option={resolvedOption} />;
                    }}
                  </Enum>
                </BoxCard>

                <Enum moduleName="taskType">
                  {taskTypeList => {
                    const typeLabelMap = {};
                    (taskTypeList || []).forEach(item => {
                      const value = String(item.value);
                      typeLabelMap[value] = item.label || item.description || value;
                    });
                    const buildTaskTypeOptions = types => types.map((type, i) => ({
                      value: type,
                      label: typeLabelMap[type] || type,
                      color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length]
                    }));
                    const manualTaskTypeOptions = buildTaskTypeOptions(manualDurationTaskTypes);
                    const systemTaskTypeOptions = buildTaskTypeOptions(systemDurationTaskTypes);
                    const renderTaskTypeSelect = (value, onChange, options) => {
                      const optionColorMap = options.reduce((result, option) => {
                        result[option.value] = option.color;
                        return result;
                      }, {});
                      return (
                        <Select
                          mode="multiple"
                          allowClear
                          variant="borderless"
                          showSearch={false}
                          size="small"
                          maxTagCount="responsive"
                          className={style.durationTaskTypeSelect}
                          value={value}
                          options={options}
                          placeholder={formatMessage({ id: 'TaskTypeFilterPlaceholder' })}
                          onChange={onChange}
                          tagRender={({ label, value: tagValue, closable, onClose }) => {
                            const color = optionColorMap[tagValue] || PALETTE.total;
                            return (
                              <Tag
                                className={style.durationTaskTypeTag}
                                closable={closable}
                                onClose={onClose}
                                style={{
                                  color,
                                  borderColor: `${color}55`,
                                  background: `${color}14`
                                }}
                              >
                                {label}
                              </Tag>
                            );
                          }}
                          style={{ minWidth: 180 }}
                        />
                      );
                    };

                    return (
                      <Row gutter={[16, 16]} className={style.historyDurationRunnerRow}>
                        <Col xs={24} lg={12} className={style.chartCol}>
                          <BoxCard
                            className={`${style.chartCardSurface} ${style.historyTrendCard}`}
                            title={formatMessage({ id: 'ManualExecution' })}
                            extra={renderTaskTypeSelect(effectiveManualDurationTypes, setManualDurationTypes, manualTaskTypeOptions)}
                          >
                            <Echart style={{ height: 320 }} option={manualDurationOption} />
                          </BoxCard>
                        </Col>
                        <Col xs={24} lg={12} className={style.chartCol}>
                          <BoxCard
                            className={`${style.chartCardSurface} ${style.historyTrendCard}`}
                            title={formatMessage({ id: 'AutomaticExecution' })}
                            extra={renderTaskTypeSelect(effectiveSystemDurationTypes, setSystemDurationTypes, systemTaskTypeOptions)}
                          >
                            <Echart style={{ height: 320 }} option={systemDurationOption} />
                          </BoxCard>
                        </Col>
                      </Row>
                    );
                  }}
                </Enum>

                <Enum moduleName="taskType">
                  {taskTypeList => {
                    const typeLabelMap = {};
                    (taskTypeList || []).forEach(item => {
                      typeLabelMap[String(item.value)] = item.label || item.description || item.value;
                    });

                    const hourlyCompletionTrend = data?.hourlyCompletionTrend || [];
                    const rangeDates = buildRangeDateSet(range);
                    const hourLabels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
                    const empty24 = () => Array.from({ length: 24 }, () => 0);

                    const statusCountField = {
                      success: 'successCount',
                      failed: 'failedCount',
                      canceled: 'canceledCount',
                      running: 'runningCount',
                      pending: 'pendingCount',
                      waiting: 'waitingCount'
                    };

                    const baseAxes = {
                      xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: hourLabels,
                        axisLine: axisLineStyle,
                        axisTick: { show: false },
                        axisLabel: { ...axisLabelStyle, fontSize: 10, interval: 1 }
                      },
                      yAxis: {
                        type: 'value',
                        ...splitLineStyle,
                        axisLabel: { ...axisLabelStyle, minInterval: 1 },
                        min: 0
                      }
                    };

                    let option;
                    if (hourlyHistoryDim === 'status') {
                      const seriesData = {};
                      TASK_STATUS_LIST.forEach(s => {
                        seriesData[s] = empty24();
                      });
                      hourlyCompletionTrend.forEach(r => {
                        if (!r?.date || !rangeDates.has(r.date)) return;
                        const h = Number(r.hour);
                        if (!Number.isFinite(h) || h < 0 || h >= 24) return;
                        if (r.status != null && (r.count != null || r.totalCompleted != null)) {
                          const st = String(r.status);
                          if (seriesData[st]) {
                            seriesData[st][h] += Number(r.count != null ? r.count : r.totalCompleted) || 0;
                          }
                          return;
                        }
                        TASK_STATUS_LIST.forEach(st => {
                          const field = statusCountField[st];
                          if (field && r[field] != null) {
                            seriesData[st][h] += Number(r[field]) || 0;
                          }
                        });
                      });
                      const activeStatuses = TASK_STATUS_LIST.filter(st =>
                        seriesData[st].reduce((a, b) => a + b, 0) > 0
                      );
                      if (activeStatuses.length === 0) {
                        const totals = empty24();
                        hourlyCompletionTrend.forEach(r => {
                          if (!r?.date || !rangeDates.has(r.date)) return;
                          const hh = Number(r.hour);
                          if (!Number.isFinite(hh) || hh < 0 || hh >= 24) return;
                          totals[hh] += Number(r.totalCompleted) || 0;
                        });
                        const totalLabel = formatMessage({ id: 'TotalCount' });
                        option = {
                          color: [PALETTE.total],
                          tooltip: tooltipStyle,
                          legend: { ...legendCenterStyle, data: [totalLabel] },
                          grid: { ...lineChartGrid, bottom: 28 },
                          ...baseAxes,
                          series: [
                            {
                              name: totalLabel,
                              type: 'line',
                              smooth: lineSmooth,
                              symbol: 'circle',
                              symbolSize: 5,
                              data: totals,
                              lineStyle: { width: 2, color: PALETTE.total },
                              itemStyle: { color: PALETTE.total, borderColor: '#fff', borderWidth: 1 },
                              emphasis: { focus: 'series' },
                              areaStyle: { color: `${PALETTE.total}18` }
                            }
                          ]
                        };
                      } else {
                        const legendData = activeStatuses.map(s =>
                          formatMessage({ id: s.charAt(0).toUpperCase() + s.slice(1) })
                        );
                        const series = activeStatuses.map((st, i) => ({
                          name: legendData[i],
                          type: 'line',
                          smooth: lineSmooth,
                          symbol: 'circle',
                          symbolSize: 4,
                          data: seriesData[st],
                          lineStyle: { width: 1.5, color: HOURLY_STATUS_LINE_COLOR_MAP[st] },
                          itemStyle: { color: HOURLY_STATUS_LINE_COLOR_MAP[st], borderColor: '#fff', borderWidth: 1 },
                          emphasis: { focus: 'series' }
                        }));
                        option = {
                          color: activeStatuses.map(s => HOURLY_STATUS_LINE_COLOR_MAP[s]),
                          tooltip: tooltipStyle,
                          legend: { ...legendCenterStyle, data: legendData },
                          grid: { ...lineChartGrid, bottom: 28 },
                          ...baseAxes,
                          series
                        };
                      }
                    } else {
                      const byType = {};
                      hourlyCompletionTrend.forEach(r => {
                        if (!r?.date || !rangeDates.has(r.date)) return;
                        const h = Number(r.hour);
                        if (!Number.isFinite(h) || h < 0 || h >= 24) return;
                        const t = r.type != null && r.type !== '' ? String(r.type) : null;
                        if (!t) return;
                        if (!byType[t]) byType[t] = empty24();
                        byType[t][h] += Number(r.totalCompleted) || 0;
                      });
                      const typeKeys = Object.keys(byType).sort();
                      if (typeKeys.length === 0) {
                        const totals = empty24();
                        hourlyCompletionTrend.forEach(r => {
                          if (!r?.date || !rangeDates.has(r.date)) return;
                          const h = Number(r.hour);
                          if (!Number.isFinite(h) || h < 0 || h >= 24) return;
                          totals[h] += Number(r.totalCompleted) || 0;
                        });
                        const totalLabel = formatMessage({ id: 'TotalCount' });
                        option = {
                          color: [PALETTE.total],
                          tooltip: tooltipStyle,
                          legend: { ...legendCenterStyle, data: [totalLabel] },
                          grid: { ...lineChartGrid, bottom: 28 },
                          ...baseAxes,
                          series: [
                            {
                              name: totalLabel,
                              type: 'line',
                              smooth: lineSmooth,
                              symbol: 'circle',
                              symbolSize: 5,
                              data: totals,
                              lineStyle: { width: 2, color: PALETTE.total },
                              itemStyle: { color: PALETTE.total, borderColor: '#fff', borderWidth: 1 },
                              emphasis: { focus: 'series' },
                              areaStyle: { color: `${PALETTE.total}18` }
                            }
                          ]
                        };
                      } else {
                        const legendData = typeKeys.map(t => typeLabelMap[t] || t);
                        const series = typeKeys.map((t, i) => ({
                          name: typeLabelMap[t] || t,
                          type: 'line',
                          smooth: lineSmooth,
                          symbol: 'circle',
                          symbolSize: 4,
                          data: byType[t],
                          lineStyle: { width: 1.5, color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length] },
                          itemStyle: {
                            color: TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length],
                            borderColor: '#fff',
                            borderWidth: 1
                          },
                          emphasis: { focus: 'series' }
                        }));
                        option = {
                          color: typeKeys.map((_, i) => TASK_TYPE_COLOR_MAP[i % TASK_TYPE_COLOR_MAP.length]),
                          tooltip: tooltipStyle,
                          legend: { ...legendCenterStyle, data: legendData },
                          grid: { ...lineChartGrid, bottom: 28 },
                          ...baseAxes,
                          series
                        };
                      }
                    }

                    return (
                      <BoxCard
                        className={`${style.chartCardSurface} ${style.historyTrendCard}`}
                        title={formatMessage({ id: 'HistoricalHourlyTrendTitle' })}
                        extra={
                          <Segmented
                            className={style.historyHourlyTrendSegmented}
                            size="small"
                            value={hourlyHistoryDim}
                            onChange={setHourlyHistoryDim}
                            options={[
                              { label: formatMessage({ id: 'HourlyTrendModeByType' }), value: 'type' },
                              { label: formatMessage({ id: 'HourlyTrendModeByStatus' }), value: 'status' }
                            ]}
                          />
                        }
                      >
                        <Echart key={`${range}-${hourlyHistoryDim}`} style={{ height: 340 }} option={option} />
                      </BoxCard>
                    );
                  }}
                </Enum>
              </>
            );
          }}
        />
      </>
    );
  })
);

export default HistorySection;
