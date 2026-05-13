import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { Col, Row, Space, Tag } from 'antd';
import { BarChartOutlined, MailOutlined, MessageOutlined } from '@ant-design/icons';
import { Card as BoxCard, ColorfulCard } from '@kne/react-box';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import { PALETTE, TIME_PERIODS, tooltipStyle, legendCenterStyle, lineChartGrid, axisLineStyle, axisLabelStyle, splitLineStyle } from './constants';
import useRealtimeStatisticsSSE from './useRealtimeStatisticsSSE';
import style from './dashboard.module.scss';

const HOURS_IN_DAY = 24;
const STATUS_SERIES = [
  { key: 'success', label: '成功', color: '#10b981' },
  { key: 'running', label: '执行中', color: '#3b82f6' },
  { key: 'pending', label: '等待', color: '#f59e0b' },
  { key: 'canceled', label: '取消', color: '#94a3b8' },
  { key: 'failed', label: '错误', color: '#ef4444' }
];

/**
 * 合并 hourlyTrend（按小时总量）与 hourlyTrendByType（按小时+类型），得到 0–23 点完整序列。
 * 新接口示例：hourlyTrend:[{hour:4,count:1}], hourlyTrendByType:[{hour:4,type:0,count:1}]
 */
const buildTodayHourlySlots = raw => {
  const slots = Array.from({ length: HOURS_IN_DAY }, (_, h) => ({
    hour: h,
    total: 0,
    email: 0,
    sms: 0,
    hasTotalFromApi: false
  }));

  const hourlyTrend = Array.isArray(raw?.hourlyTrend) ? raw.hourlyTrend : [];
  const hourlyTrendByType = Array.isArray(raw?.hourlyTrendByType) ? raw.hourlyTrendByType : [];
  const hasHourly = hourlyTrend.length > 0 || hourlyTrendByType.length > 0;

  if (hasHourly) {
    // 参考 fastify-task：前端图表主口径使用后端聚合的 hourly 数据
    hourlyTrend.forEach(item => {
      const h = Number(item?.hour);
      if (!Number.isFinite(h) || h < 0 || h >= HOURS_IN_DAY) return;
      slots[h].total = Number(item?.count) || 0;
      slots[h].hasTotalFromApi = true;
    });

    hourlyTrendByType.forEach(item => {
      const h = Number(item?.hour);
      if (!Number.isFinite(h) || h < 0 || h >= HOURS_IN_DAY) return;
      const n = Number(item?.count) || 0;
      const typ = Number(item?.type);
      if (typ === 0) slots[h].email += n;
      else if (typ === 1) slots[h].sms += n;
    });

    for (let h = 0; h < HOURS_IN_DAY; h++) {
      const s = slots[h];
      const parts = s.email + s.sms;
      if (!s.hasTotalFromApi && parts > 0) {
        s.total = parts;
      }
    }
  } else {
    // 仅在后端未返回 hourly 聚合时，退回 records 计算
    const records = Array.isArray(raw?.records) ? raw.records : [];
    records.forEach(item => {
      const date = item?.createdAt ? new Date(item.createdAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;
      const h = date.getHours();
      if (!Number.isFinite(h) || h < 0 || h >= HOURS_IN_DAY) return;
      const typ = Number(item?.type);
      if (typ === 0) slots[h].email += 1;
      else if (typ === 1) slots[h].sms += 1;
      slots[h].total += 1;
      slots[h].hasTotalFromApi = true;
    });
  }

  return slots;
};

const hasHourlyInput = raw => {
  const records = raw?.records;
  const a = raw?.hourlyTrend;
  const b = raw?.hourlyTrendByType;
  return (
    (Array.isArray(records) && records.length > 0) ||
    (Array.isArray(a) && a.length > 0) ||
    (Array.isArray(b) && b.length > 0)
  );
};

/** 当前接口：byType 为 { "0": n, "1": m }，totalRecords 为数字 */
const buildRealtimeDisplayStats = raw => {
  if (!raw || typeof raw !== 'object') {
    return { totalRecords: 0, email: 0, sms: 0 };
  }
  const bt = raw.byType && typeof raw.byType === 'object' ? raw.byType : {};
  const email = Number(bt['0']) || 0;
  const sms = Number(bt['1']) || 0;
  let totalRecords = Number(raw.totalRecords);
  if (!Number.isFinite(totalRecords)) totalRecords = 0;
  return { totalRecords, email, sms };
};

const RealtimeSection = createWithRemoteLoader({
  modules: ['components-thirdparty:Echart']
})(
  withLocale(({ remoteModules, apis }) => {
    const [Echart] = remoteModules;
    const { formatMessage } = useIntl();
    const sseUrl = apis?.messageManger?.statistics?.sse?.url;
    const { realtimeData, isConnected, lastUpdatedAt } = useRealtimeStatisticsSSE(sseUrl);

    const displayStats = useMemo(() => buildRealtimeDisplayStats(realtimeData), [realtimeData]);

    const { emailPct, smsPct } = useMemo(() => {
      const t = displayStats.totalRecords;
      if (!t || t <= 0) return { emailPct: null, smsPct: null };
      const e = (displayStats.email / t) * 100;
      const s = (displayStats.sms / t) * 100;
      return { emailPct: e.toFixed(1), smsPct: s.toFixed(1) };
    }, [displayStats]);

    const lastUpdatedShort = useMemo(() => {
      if (!lastUpdatedAt) return '';
      try {
        return new Intl.DateTimeFormat(undefined, {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(new Date(lastUpdatedAt));
      } catch {
        return new Date(lastUpdatedAt).toLocaleTimeString();
      }
    }, [lastUpdatedAt]);

    // 时段汇总：与 hourly 序列同源（buildTodayHourlySlots），按四小时段聚合
    const periodStats = useMemo(() => {
      if (!realtimeData || !hasHourlyInput(realtimeData)) return [];
      const slots = buildTodayHourlySlots(realtimeData);
      return TIME_PERIODS.map(period => {
        let email = 0;
        let sms = 0;
        let total = 0;
        for (let h = period.start; h < period.end; h++) {
          const s = slots[h];
          email += s.email;
          sms += s.sms;
          total += s.hasTotalFromApi ? s.total : s.email + s.sms;
        }
        return { ...period, total, email, sms };
      });
    }, [realtimeData]);

    /** 今日每小时趋势：按任务类型（hourlyTrendByType） */
    const hourlyOption = useMemo(() => {
      const hourlyTrendByType = Array.isArray(realtimeData?.hourlyTrendByType) ? realtimeData.hourlyTrendByType : [];
      if (hourlyTrendByType.length === 0) return null;

      const hours = Array.from({ length: HOURS_IN_DAY }, (_, h) => h);
      const typeMap = {};
      hourlyTrendByType.forEach(item => {
        const h = Number(item?.hour);
        const type = String(item?.type);
        if (!Number.isFinite(h) || h < 0 || h >= HOURS_IN_DAY || !type) return;
        if (!typeMap[type]) typeMap[type] = Array.from({ length: HOURS_IN_DAY }, () => 0);
        typeMap[type][h] += Number(item?.count) || 0;
      });

      const typeKeys = Object.keys(typeMap);
      if (typeKeys.length === 0) return null;

      return {
        color: PALETTE.pie,
        tooltip: tooltipStyle,
        legend: {
          ...legendCenterStyle,
          data: typeKeys.map(key => `Type ${key}`)
        },
        grid: { ...lineChartGrid, bottom: 28 },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: hours.map(h => `${String(h).padStart(2, '0')}:00`),
          axisLine: axisLineStyle,
          axisTick: { show: false },
          axisLabel: {
            ...axisLabelStyle,
            fontSize: 10,
            interval: 1,
            rotate: 0
          }
        },
        yAxis: { type: 'value', ...splitLineStyle, axisLabel: axisLabelStyle, minInterval: 1, min: 0 },
        series: typeKeys.map((key, index) => ({
          name: `Type ${key}`,
          type: 'line',
          symbol: 'circle',
          symbolSize: 5,
          smooth: 0.28,
          data: typeMap[key],
          lineStyle: { width: 2.5, color: PALETTE.pie[index % PALETTE.pie.length] },
          itemStyle: { color: PALETTE.pie[index % PALETTE.pie.length], borderColor: '#fff', borderWidth: 2 },
          emphasis: { focus: 'series' }
        }))
      };
    }, [realtimeData]);

    /** 时段对比：按状态（成功/执行中/等待/取消/错误） */
    const periodCompareOption = useMemo(() => {
      const hourlyTrendByStatus = Array.isArray(realtimeData?.hourlyTrendByStatus) ? realtimeData.hourlyTrendByStatus : [];
      if (hourlyTrendByStatus.length === 0) return null;
      const labels = TIME_PERIODS.map(p => formatMessage({ id: p.id }));
      const statusData = STATUS_SERIES.reduce((acc, cur) => ({ ...acc, [cur.key]: [0, 0, 0, 0] }), {});

      hourlyTrendByStatus.forEach(item => {
        const h = Number(item?.hour);
        const status = String(item?.status || '');
        const count = Number(item?.count) || 0;
        if (!Number.isFinite(h) || !statusData[status]) return;
        const periodIndex = TIME_PERIODS.findIndex(p => h >= p.start && h < p.end);
        if (periodIndex >= 0) statusData[status][periodIndex] += count;
      });

      return {
        color: STATUS_SERIES.map(item => item.color),
        tooltip: {
          ...tooltipStyle,
          trigger: 'axis',
          axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(148,163,184,0.15)' } }
        },
        legend: { ...legendCenterStyle, data: STATUS_SERIES.map(item => item.label) },
        grid: { ...lineChartGrid, bottom: 20 },
        xAxis: {
          type: 'category',
          data: labels,
          axisLine: axisLineStyle,
          axisTick: { show: false },
          axisLabel: { color: '#64748b', fontSize: 12 }
        },
        yAxis: { type: 'value', ...splitLineStyle, axisLabel: axisLabelStyle, minInterval: 1, min: 0 },
        series: STATUS_SERIES.map((item, index) => ({
          name: item.label,
          type: 'bar',
          data: statusData[item.key],
          barMaxWidth: 24,
          itemStyle: { color: item.color, borderRadius: [4, 4, 0, 0] },
          emphasis: { focus: 'series' },
          z: 10 - index
        }))
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
                {formatMessage({ id: 'TotalCount' })} <strong style={{ color: PALETTE.total }}>{displayStats.totalRecords}</strong>
                {' · '}
                <span style={{ color: PALETTE.email }}>{formatMessage({ id: 'Email' })}</span>{' '}
                <strong style={{ color: PALETTE.email }}>{displayStats.email}</strong>
                {emailPct != null ? <span> ({emailPct}%)</span> : null}
                {' · '}
                <span style={{ color: PALETTE.sms }}>{formatMessage({ id: 'SMS' })}</span>{' '}
                <strong style={{ color: PALETTE.sms }}>{displayStats.sms}</strong>
                {smsPct != null ? <span> ({smsPct}%)</span> : null}
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
          <>
            <div className={`${style.kpiRow} ${style.kpiRowDense}`}>
              <ColorfulCard
                className={`${style.kpiCard} ${style.kpiCardDense}`}
                color={PALETTE.total}
                icon={<BarChartOutlined />}
                title={<span className={style.kpiValueDense} style={{ color: PALETTE.total }}>{displayStats.totalRecords}</span>}
                description={
                  <span className={style.kpiDescDense}>
                    {formatMessage({ id: 'TodayRecords' })}
                    {displayStats.totalRecords > 0 &&
                    displayStats.email + displayStats.sms !== displayStats.totalRecords ? (
                      <>
                        {' · '}
                        {formatMessage({ id: 'Email' })}+{formatMessage({ id: 'SMS' })}={displayStats.email + displayStats.sms}
                      </>
                    ) : null}
                  </span>
                }
              />
              <ColorfulCard
                className={`${style.kpiCard} ${style.kpiCardDense}`}
                color={PALETTE.email}
                icon={<MailOutlined />}
                title={<span className={style.kpiValueDense} style={{ color: PALETTE.email }}>{displayStats.email}</span>}
                description={
                  <span className={style.kpiDescDense}>
                    {formatMessage({ id: 'TodayEmail' })}
                    {emailPct != null ? ` · ${emailPct}%` : ''}
                  </span>
                }
              />
              <ColorfulCard
                className={`${style.kpiCard} ${style.kpiCardDense}`}
                color={PALETTE.sms}
                icon={<MessageOutlined />}
                title={<span className={style.kpiValueDense} style={{ color: PALETTE.sms }}>{displayStats.sms}</span>}
                description={
                  <span className={style.kpiDescDense}>
                    {formatMessage({ id: 'TodaySMS' })}
                    {smsPct != null ? ` · ${smsPct}%` : ''}
                  </span>
                }
              />
            </div>

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
                      <Tag
                        style={{
                          margin: 0,
                          color: PALETTE.email,
                          background: `${PALETTE.email}14`,
                          borderColor: `${PALETTE.email}50`
                        }}
                      >
                        {formatMessage({ id: 'Email' })}{' '}
                        <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{period.email}</span>
                      </Tag>
                      <Tag
                        style={{
                          margin: 0,
                          color: PALETTE.sms,
                          background: `${PALETTE.sms}14`,
                          borderColor: `${PALETTE.sms}50`
                        }}
                      >
                        {formatMessage({ id: 'SMS' })}{' '}
                        <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{period.sms}</span>
                      </Tag>
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
                  {hourlyOption ? (
                    <Echart style={{ height: 320 }} option={hourlyOption} />
                  ) : (
                    <div className={style.emptyState}>{formatMessage({ id: 'NoData' })}</div>
                  )}
                </BoxCard>
              </Col>
            </Row>
          </>
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
