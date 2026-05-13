import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useState, useRef } from 'react';
import { Button, Col, Row, Space, Segmented, Tag } from 'antd';
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

const HistorySection = createWithRemoteLoader({
  modules: ['components-thirdparty:Echart', 'components-core:Enum']
})(
  withLocale(({ remoteModules, apis }) => {
    const [Echart, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const [range, setRange] = useState('7d');
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
              if (recentTrend.length === 0) return null;

              const dateMap = {};
              recentTrend.forEach(item => {
                dateMap[item.date] = { date: item.date, total: item.count };
              });
              recentTrendByType.forEach(item => {
                if (!dateMap[item.date]) {
                  dateMap[item.date] = { date: item.date, total: 0 };
                }
                dateMap[item.date][item.type] = item.count;
              });

              const sorted = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
              const dates = sorted.map(item => item.date);
              const totals = sorted.map(item => item.total);
              const manyPoints = dates.length > 14;

              // 收集所有出现过的 type
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
                : null;

            const typeEntries = Object.entries(byType)
              .map(([type, count]) => ({ type: String(type), count: Number(count) || 0 }))
              .filter(({ count }) => count > 0)
              .sort((a, b) => b.count - a.count);
            const typeTotal = typeEntries.reduce((sum, { count }) => sum + count, 0);

            const durationTrend = data?.durationTrend || [];

            const buildWaitExecDurationOption = rows => {
              if (!rows || rows.length === 0) return null;
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

            const manualDurationRows = durationTrend.map(day => {
              const b = day?.byRunnerType?.manual;
              return {
                date: day.date,
                avgWaitingTime: b?.avgWaitingTime ?? 0,
                avgExecutionTime: b?.avgExecutionTime ?? 0
              };
            });
            const systemDurationRows = durationTrend.map(day => {
              const b = day?.byRunnerType?.system;
              return {
                date: day.date,
                avgWaitingTime: b?.avgWaitingTime ?? 0,
                avgExecutionTime: b?.avgExecutionTime ?? 0
              };
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
                      {statusHBarOption ? (
                        <div className={style.historySplitLegendBar}>
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
                          <div className={style.historySplitBar}>
                            <Echart
                              style={{ height: Math.max(112, statusDistItems.length * 28) }}
                              option={statusHBarOption}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className={style.historyBarSplitEmpty}>{formatMessage({ id: 'NoData' })}</div>
                      )}
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
                          : null;
                      return (
                        <div className={style.historyBarRow}>
                          <div className={style.historyBarRowLabel}>
                            {formatMessage({ id: 'TaskTypeDistribution' })}
                          </div>
                          <div className={style.historyBarRowSplit}>
                            {typeHBarOption ? (
                              <div className={style.historySplitLegendBar}>
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
                                <div className={style.historySplitBar}>
                                  <Echart
                                    style={{ height: Math.max(112, typeDistItems.length * 28) }}
                                    option={typeHBarOption}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className={style.historyBarSplitEmpty}>{formatMessage({ id: 'NoData' })}</div>
                            )}
                          </div>
                        </div>
                      );
                    }}
                  </Enum>
                </div>

                <BoxCard className={`${style.chartCardSurface} ${style.historyTrendCard} ${style.historyTrendTightTop}`}>
                  {trendOption ? (
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
                  ) : (
                    <div className={style.emptyState}>{formatMessage({ id: 'NoData' })}</div>
                  )}
                </BoxCard>

                {durationTrend.length > 0 ? (
                  <Row gutter={[16, 16]} className={style.historyDurationRunnerRow}>
                    <Col xs={24} lg={12} className={style.chartCol}>
                      <BoxCard
                        className={`${style.chartCardSurface} ${style.historyTrendCard}`}
                        title={formatMessage({ id: 'ManualExecution' })}
                      >
                        {manualDurationOption ? (
                          <Echart style={{ height: 320 }} option={manualDurationOption} />
                        ) : (
                          <div className={style.emptyState}>{formatMessage({ id: 'NoData' })}</div>
                        )}
                      </BoxCard>
                    </Col>
                    <Col xs={24} lg={12} className={style.chartCol}>
                      <BoxCard
                        className={`${style.chartCardSurface} ${style.historyTrendCard}`}
                        title={formatMessage({ id: 'AutomaticExecution' })}
                      >
                        {systemDurationOption ? (
                          <Echart style={{ height: 320 }} option={systemDurationOption} />
                        ) : (
                          <div className={style.emptyState}>{formatMessage({ id: 'NoData' })}</div>
                        )}
                      </BoxCard>
                    </Col>
                  </Row>
                ) : null}
              </>
            );
          }}
        />
      </>
    );
  })
);

export default HistorySection;
