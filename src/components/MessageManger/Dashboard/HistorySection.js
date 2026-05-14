import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useState, useRef } from 'react';
import { Button, Col, Row, Space, Segmented } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Card as BoxCard } from '@kne/react-box';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import {
  PALETTE,
  RANGE_OPTIONS,
  tooltipStyle,
  itemTooltipStyle,
  pieSeries,
  legendPieTypeStyle,
  legendPieCodeStyle,
  legendCenterStyle,
  lineChartGrid,
  lineChartGridWithRotatedLabels,
  lineSmooth,
  axisLineStyle,
  axisLabelStyle,
  splitLineStyle
} from './constants';
import SectionHeader from './SectionHeader';
import { getClientIanaTimezone } from '../utils';
import style from './dashboard.module.scss';

const RANGE_DAY_COUNT = { '7d': 7, '1m': 30, '1y': 365 };

/** 本地日历上从 range 起点到今天的日期轴（YYYY-MM-DD） */
const buildLocalDateAxisForRange = rangeKey => {
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

const HistorySection = createWithRemoteLoader({
  modules: ['components-thirdparty:Echart']
})(
  withLocale(({ remoteModules, apis }) => {
    const [Echart] = remoteModules;
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
          {...Object.assign({}, apis.messageManger.statistics.getOverview, {
            params: { range, timezone: getClientIanaTimezone() }
          })}
          render={({ data, reload }) => {
            reloadRef.current = reload;

            const templateStats = data?.templateStats || {};
            const byType = data?.byType || {};

          // 发送趋势折线图
          const trendOption = (() => {
            const recentTrend = data?.recentTrend || [];
            const recentTrendByType = data?.recentTrendByType || [];
            const axisDates = recentTrend.length > 0 ? null : buildLocalDateAxisForRange(range);

            const dateMap = {};
            if (recentTrend.length > 0) {
              recentTrend.forEach(item => {
                dateMap[item.date] = { date: item.date, total: item.count };
              });
            } else {
              axisDates.forEach(d => {
                dateMap[d] = { date: d, total: 0 };
              });
            }
            recentTrendByType.forEach(item => {
              if (!dateMap[item.date]) {
                dateMap[item.date] = { date: item.date, total: 0 };
              }
              const key = item.type === 0 ? 'email' : 'sms';
              dateMap[item.date][key] = item.count;
            });

            const sorted = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
            const dates = sorted.map(item => item.date);
            const totals = sorted.map(item => item.total);
            const emails = sorted.map(item => item.email || 0);
            const smsList = sorted.map(item => item.sms || 0);
            const manyPoints = dates.length > 14;

            return {
              color: [PALETTE.total, PALETTE.email, PALETTE.sms],
              tooltip: tooltipStyle,
              legend: { ...legendCenterStyle, data: [formatMessage({ id: 'TotalCount' }), formatMessage({ id: 'Email' }), formatMessage({ id: 'SMS' })] },
              grid: manyPoints ? lineChartGridWithRotatedLabels : lineChartGrid,
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates,
                axisLine: axisLineStyle,
                axisTick: { show: false },
                axisLabel: {
                  ...axisLabelStyle,
                  fontSize: 11,
                  rotate: manyPoints ? 28 : 0,
                  hideOverlap: true
                }
              },
              yAxis: { type: 'value', ...splitLineStyle, axisLabel: axisLabelStyle, minInterval: 1 },
              series: [
                {
                  name: formatMessage({ id: 'TotalCount' }),
                  type: 'line',
                  smooth: lineSmooth,
                  symbol: 'circle',
                  symbolSize: 6,
                  data: totals,
                  lineStyle: { width: 2.5, color: PALETTE.total },
                  itemStyle: { color: PALETTE.total, borderColor: '#fff', borderWidth: 2 },
                  emphasis: { focus: 'series' },
                  areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.18)' }, { offset: 1, color: 'rgba(59,130,246,0.02)' }] } }
                },
                {
                  name: formatMessage({ id: 'Email' }),
                  type: 'line',
                  smooth: lineSmooth,
                  symbol: 'circle',
                  symbolSize: 6,
                  data: emails,
                  lineStyle: { width: 2.5, color: PALETTE.email },
                  itemStyle: { color: PALETTE.email, borderColor: '#fff', borderWidth: 2 },
                  emphasis: { focus: 'series' },
                  areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(99,102,241,0.18)' }, { offset: 1, color: 'rgba(99,102,241,0.02)' }] } }
                },
                {
                  name: formatMessage({ id: 'SMS' }),
                  type: 'line',
                  smooth: lineSmooth,
                  symbol: 'circle',
                  symbolSize: 6,
                  data: smsList,
                  lineStyle: { width: 2.5, color: PALETTE.sms },
                  itemStyle: { color: PALETTE.sms, borderColor: '#fff', borderWidth: 2 },
                  emphasis: { focus: 'series' },
                  areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(6,182,212,0.16)' }, { offset: 1, color: 'rgba(6,182,212,0.02)' }] } }
                }
              ]
            };
          })();

          // 编码饼图
          const codePieOption = (() => {
            const byCode = data?.byCode || {};
            const entries = Object.entries(byCode);
            if (entries.length === 0) {
              return {
                tooltip: { show: false },
                legend: { show: false },
                graphic: [
                  {
                    type: 'text',
                    left: 'center',
                    top: 'center',
                    style: {
                      text: formatMessage({ id: 'NoData' }),
                      fill: '#94a3b8',
                      fontSize: 14,
                      fontWeight: 500
                    }
                  }
                ],
                series: [
                  {
                    ...pieSeries(['50%', '42%'], ['44%', '62%']),
                    silent: true,
                    data: [{ value: 1, name: '', itemStyle: { color: '#f1f5f9' }, label: { show: false } }]
                  }
                ]
              };
            }
            return {
              color: PALETTE.pie,
              tooltip: itemTooltipStyle,
              legend: legendPieCodeStyle,
              series: [
                {
                  ...pieSeries(['50%', '42%'], ['44%', '62%']),
                  data: entries.map(([code, count]) => ({ name: code, value: count }))
                }
              ]
            };
          })();

          // 类型饼图
          const typePieOption = {
            color: [PALETTE.email, PALETTE.sms],
            tooltip: itemTooltipStyle,
            legend: legendPieTypeStyle,
            series: [
              {
                ...pieSeries(['50%', '44%'], ['46%', '66%']),
                data: [
                  { name: formatMessage({ id: 'Email' }), value: Number(byType['0']) || 0 },
                  { name: formatMessage({ id: 'SMS' }), value: Number(byType['1']) || 0 }
                ]
              }
            ]
          };

          const historyStatItems = [
            {
              label: formatMessage({ id: 'TotalRecords' }),
              value: data?.totalRecords || 0,
              color: PALETTE.total
            },
            {
              label: `${formatMessage({ id: 'Email' })}${formatMessage({ id: 'TotalRecords' })}`,
              value: Number(byType['0']) || 0,
              color: PALETTE.email
            },
            {
              label: `${formatMessage({ id: 'SMS' })}${formatMessage({ id: 'TotalRecords' })}`,
              value: Number(byType['1']) || 0,
              color: PALETTE.sms
            },
            {
              label: formatMessage({ id: 'TemplateTotal' }),
              value: templateStats.total || 0,
              color: '#d97706'
            },
            {
              label: formatMessage({ id: 'EnabledTemplates' }),
              value: Number(templateStats.byStatus?.['0']) || 0,
              color: PALETTE.enabled
            },
            {
              label: formatMessage({ id: 'DisabledTemplates' }),
              value: Number(templateStats.byStatus?.['1']) || 0,
              color: PALETTE.disabled
            }
          ];

          return (
            <>
              <div className={style.historyStatsGrid}>
                {historyStatItems.map(item => (
                  <div key={item.label} className={style.historyStatCell} style={{ borderLeftColor: item.color }}>
                    <div className={style.historyStatLabel}>{item.label}</div>
                    <div className={style.historyStatValue} style={{ color: item.color }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <BoxCard className={`${style.chartCardSurface} ${style.historyTrendCard}`}>
                <Echart style={{ height: 380 }} option={trendOption} />
              </BoxCard>

              <Row gutter={[20, 24]} className={style.historyPiesRow}>
                <Col xs={24} lg={12} className={style.chartCol}>
                  <BoxCard className={style.chartCardSurface} title={formatMessage({ id: 'TypeDistribution' })} style={{ height: '100%' }}>
                    {typePieOption ? <Echart style={{ height: 320 }} option={typePieOption} /> : null}
                  </BoxCard>
                </Col>
                <Col xs={24} lg={12} className={style.chartCol}>
                  <BoxCard className={style.chartCardSurface} title={formatMessage({ id: 'ByCodeStats' })} style={{ height: '100%' }}>
                    <Echart style={{ height: 320 }} option={codePieOption} />
                  </BoxCard>
                </Col>
              </Row>
            </>
          );
        }}
        />
      </>
    );
  })
);

export default HistorySection;
