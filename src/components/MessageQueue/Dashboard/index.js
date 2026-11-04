import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useIsMobile } from '@kne/responsive-utils';
import { useEffect, useMemo, useState } from 'react';
import { Button, Segmented, Tooltip } from 'antd';
import { ReloadOutlined, ThunderboltFilled } from '@ant-design/icons';
import { defaultColors } from '@kne/react-box';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Menu from '../Menu';
import { buildUrlWithParams, formatPercent, formatRate, getMetricTotal } from '../utils';
import useManagedEventSource from '../../../utils/useManagedEventSource';
import { Panel, Metric, RankList, LiveBadge, SectionIcon } from '../../../utils/dashboard/ui';
import {
  PALETTE,
  TOPIC_COLORS,
  TREND_METRICS,
  pickMetricState,
  lineTooltipStyle,
  legendCenterStyle,
  lineChartGrid,
  lineSmooth,
  axisLineStyle,
  axisLabelStyle,
  splitLineStyle
} from './constants';
import style from '../../../utils/dashboard/dashboard.module.scss';

const SEGMENT_LIMIT = 4;

const toTopicRows = current => {
  const topics = new Set([
    ...Object.keys(current?.queueDepth?.byTopic || {}),
    ...Object.keys(current?.consumedTotal?.byTopic || {}),
    ...Object.keys(current?.failedTotal?.byTopic || {}),
    ...Object.keys(current?.dlqTotal?.byTopic || {}),
    ...Object.keys(current?.consumeRate?.byTopic || {}),
    ...Object.keys(current?.failureRate?.byTopic || {}),
    ...Object.keys(current?.successRatioByTopic || {})
  ]);

  return Array.from(topics).map(topic => ({
    topic,
    queueDepth: current?.queueDepth?.byTopic?.[topic] || 0,
    consumedTotal: current?.consumedTotal?.byTopic?.[topic] || 0,
    failedTotal: current?.failedTotal?.byTopic?.[topic] || 0,
    dlqTotal: current?.dlqTotal?.byTopic?.[topic] || 0,
    consumeRate: current?.consumeRate?.byTopic?.[topic] || 0,
    failureRate: current?.failureRate?.byTopic?.[topic] || 0,
    successRatio: current?.successRatioByTopic?.[topic]
  }));
};

const formatClock = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return [date.getHours(), date.getMinutes(), date.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
};

const toRankItems = (byTopic, colorOf) =>
  Object.keys(byTopic || {})
    .map(topic => ({ key: topic, label: topic, value: Number(byTopic[topic]) || 0, color: colorOf(topic) }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

const TrendPanel = ({ Echart, timeSeries, colorOf }) => {
  const { formatMessage } = useIntl();
  const isMobile = useIsMobile();
  const [metricKey, setMetricKey] = useState(TREND_METRICS[0].key);
  const metric = TREND_METRICS.find(item => item.key === metricKey);
  const points = Array.isArray(timeSeries?.[metricKey]) ? timeSeries[metricKey] : [];
  const topics = Array.from(new Set(points.flatMap(point => Object.keys(point || {}).filter(key => key !== 'timestamp'))));
  const formatValue = value => (metric.unit ? `${formatRate(value)}${metric.unit}` : Number(value || 0).toLocaleString());

  const option = {
    tooltip: { ...lineTooltipStyle, valueFormatter: formatValue },
    legend: { ...legendCenterStyle, type: 'scroll' },
    grid: lineChartGrid,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: points.map(point => formatClock(point.timestamp)),
      axisLine: axisLineStyle,
      axisTick: { show: false },
      axisLabel: axisLabelStyle
    },
    yAxis: {
      type: 'value',
      min: 0,
      ...(metric.unit ? {} : { minInterval: 1 }),
      splitLine: splitLineStyle,
      axisLabel: axisLabelStyle
    },
    series: topics.map(topic => ({
      name: topic,
      type: 'line',
      smooth: lineSmooth,
      showSymbol: false,
      data: points.map(point => Number(point?.[topic]) || 0),
      lineStyle: { width: 2, color: colorOf(topic) },
      itemStyle: { color: colorOf(topic) },
      emphasis: { focus: 'series' }
    }))
  };

  return (
    <Panel
      title={formatMessage({ id: 'TopicTrend' })}
      className={style.panelFill}
      extra={
        <Segmented
          className={style.segmented}
          size="small"
          value={metricKey}
          onChange={setMetricKey}
          options={TREND_METRICS.map(item => ({
            value: item.key,
            label: formatMessage({ id: item.labelId })
          }))}
          block={isMobile}
        />
      }
    >
      {points.length > 0 && topics.length > 0 ? (
        <div className={style.chartFill}>
          <Echart option={option} />
        </div>
      ) : (
        <div className={style.emptyLarge}>{formatMessage({ id: 'NoData' })}</div>
      )}
    </Panel>
  );
};

const DashboardContent = withLocale(({ Page, TableView, Echart, baseUrl, pageProps, apis, initialData, reload }) => {
  const { formatMessage } = useIntl();
  const [data, setData] = useState(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(initialData?.timestamp);

  useEffect(() => {
    setData(initialData);
    setLastUpdatedAt(initialData?.timestamp);
  }, [initialData]);

  const mqStreamUrl = useMemo(() => {
    const url = apis?.mq?.dashboard?.sse?.url;
    if (!url) return null;
    return buildUrlWithParams(url, { interval: 1000 });
  }, [apis]);

  useManagedEventSource(mqStreamUrl, {
    onOpen: () => setIsConnected(true),
    onError: () => setIsConnected(false),
    onMessage: event => {
      const nextData = JSON.parse(event.data);
      setData(nextData);
      setLastUpdatedAt(nextData.timestamp || Date.now());
      setIsConnected(true);
    }
  });

  const current = data?.current || {};
  const rows = toTopicRows(current);

  const colorOf = useMemo(() => {
    const topics = Array.from(
      new Set([
        ...rows.map(row => row.topic),
        ...Object.values(data?.timeSeries || {}).flatMap(points =>
          (Array.isArray(points) ? points : []).flatMap(point => Object.keys(point || {}).filter(key => key !== 'timestamp'))
        )
      ])
    );
    return topic => TOPIC_COLORS[Math.max(topics.indexOf(topic), 0) % TOPIC_COLORS.length];
  }, [rows, data]);

  const queueDepthTotal = getMetricTotal(current.queueDepth);
  const consumedTotal = getMetricTotal(current.consumedTotal);
  const failedTotal = getMetricTotal(current.failedTotal);
  const dlqTotal = getMetricTotal(current.dlqTotal);

  const depthItems = toRankItems(current.queueDepth?.byTopic, colorOf);
  const depthSegments = depthItems.slice(0, SEGMENT_LIMIT);
  const restDepth = depthItems.slice(SEGMENT_LIMIT).reduce((total, item) => total + item.value, 0);
  if (restDepth > 0) {
    depthSegments.push({ key: '__others', label: formatMessage({ id: 'OtherTopics' }), value: restDepth, color: PALETTE.muted });
  }

  const lowestTopic = Object.keys(current.successRatioByTopic || {}).reduce(
    (lowest, topic) => {
      const ratio = Number(current.successRatioByTopic[topic]);
      return Number.isFinite(ratio) && (lowest.ratio === undefined || ratio < lowest.ratio) ? { topic, ratio } : lowest;
    },
    { topic: null, ratio: undefined }
  );

  const lastUpdatedText = formatClock(lastUpdatedAt);

  const topicColumns = [
    {
      name: 'topic',
      title: formatMessage({ id: 'Topic' }),
      renderType: 'main',
      ellipsis: true
    },
    { name: 'queueDepth', title: formatMessage({ id: 'QueueDepth' }) },
    { name: 'consumedTotal', title: formatMessage({ id: 'ConsumedTotal' }) },
    { name: 'failedTotal', title: formatMessage({ id: 'FailedTotal' }) },
    { name: 'dlqTotal', title: formatMessage({ id: 'DLQTotal' }) },
    {
      name: 'consumeRate',
      title: formatMessage({ id: 'ConsumeRate' }),
      getValueOf: item => `${formatRate(item.consumeRate)}/s`
    },
    {
      name: 'failureRate',
      title: formatMessage({ id: 'FailureRate' }),
      getValueOf: item => `${formatRate(item.failureRate)}/s`
    },
    {
      name: 'successRatio',
      title: formatMessage({ id: 'SuccessRatio' }),
      getValueOf: item => formatPercent(item.successRatio)
    }
  ];

  return (
    <Page
      {...pageProps}
      title={formatMessage({ id: 'Dashboard' })}
      menu={<Menu baseUrl={baseUrl} />}
      children={
        <div className={style.dashboardRoot}>
          <div className={style.section}>
            <div className={style.sectionHead}>
              <div className={style.sectionHeadMain}>
                <h3 className={style.sectionTitle}>
                  <SectionIcon icon={<ThunderboltFilled />} tone={PALETTE.total} />
                  {formatMessage({ id: 'RealtimeQueue' })}
                </h3>
                <span className={style.sectionCaption}>{formatMessage({ id: 'TopicCount' }, { count: rows.length })}</span>
              </div>
              <div className={style.sectionHeadMain}>
                <LiveBadge
                  connected={isConnected}
                  text={formatMessage({ id: isConnected ? 'RealtimeConnected' : 'RealtimeDisconnected' })}
                  time={lastUpdatedText ? `${formatMessage({ id: 'LastUpdatedAt' })} ${lastUpdatedText}` : ''}
                />
                <Tooltip title={formatMessage({ id: 'Refresh' })}>
                  <Button type="text" size="small" icon={<ReloadOutlined />} onClick={reload} />
                </Tooltip>
              </div>
            </div>

            <div className={style.metricStrip}>
              <Metric
                card
                label={formatMessage({ id: 'QueueDepth' })}
                value={queueDepthTotal.toLocaleString()}
                segments={depthSegments.length > 0 ? depthSegments : undefined}
                hint={formatMessage({ id: 'NoBacklog' })}
              />
              <Metric
                card
                label={formatMessage({ id: 'ConsumeRate' })}
                value={`${formatRate(current.consumeRate?.total)}/s`}
                hint={`${formatMessage({ id: 'ConsumedTotal' })} ${consumedTotal.toLocaleString()}`}
              />
              <Metric
                card
                label={formatMessage({ id: 'FailureRate' })}
                value={`${formatRate(current.failureRate?.total)}/s`}
                hint={`${formatMessage({ id: 'FailedTotal' })} ${failedTotal.toLocaleString()}`}
                state={Number(current.failureRate?.total) > 0 ? defaultColors.Red : undefined}
              />
              <Metric
                card
                label={formatMessage({ id: 'DLQTotal' })}
                value={dlqTotal.toLocaleString()}
                hint={`${formatMessage({ id: 'DLQRate' })} ${formatRate(current.dlqRate?.total)}/s`}
                state={dlqTotal > 0 ? defaultColors.Orange : undefined}
              />
              <Metric
                card
                label={formatMessage({ id: 'SuccessRatio' })}
                value={formatPercent(current.successRatio)}
                hint={
                  lowestTopic.topic
                    ? `${formatMessage({ id: 'LowestTopic' })} ${lowestTopic.topic} ${formatPercent(lowestTopic.ratio)}`
                    : formatMessage({ id: 'NoData' })
                }
                state={pickMetricState(current.successRatio, { warn: 0.95, danger: 0.9 })}
              />
            </div>

            <div className={style.mainGrid}>
              <TrendPanel Echart={Echart} timeSeries={data?.timeSeries} colorOf={colorOf} />
              <div className={style.sideStack}>
                <Panel title={formatMessage({ id: 'TopicBacklog' })}>
                  <RankList items={depthItems} emptyText={formatMessage({ id: 'NoBacklog' })} />
                </Panel>
                <Panel title={formatMessage({ id: 'AbnormalTopics' })}>
                  <div className={style.block}>
                    <div className={style.blockTitle}>{formatMessage({ id: 'FailedTotal' })}</div>
                    <RankList items={toRankItems(current.failedTotal?.byTopic, () => PALETTE.failed)} emptyText={formatMessage({ id: 'NoData' })} />
                  </div>
                  <div className={style.block}>
                    <div className={style.blockTitle}>{formatMessage({ id: 'DLQTotal' })}</div>
                    <RankList items={toRankItems(current.dlqTotal?.byTopic, () => PALETTE.dlq)} emptyText={formatMessage({ id: 'NoData' })} />
                  </div>
                </Panel>
              </div>
            </div>

            <Panel title={formatMessage({ id: 'TopicDetail' })}>
              <TableView rowKey="topic" size="small" dataSource={rows} columns={topicColumns} renderMobile />
            </Panel>
          </div>
        </div>
      }
    />
  );
});

const Dashboard = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@Page', 'components-core:TablePage@TableView', 'components-thirdparty:Echart']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Page, TableView, Echart] = remoteModules;
    const { apis } = usePreset();

    return (
      <Fetch
        {...apis.mq.dashboard.getData}
        render={({ data, reload }) => {
          return (
            <DashboardContent
              Page={Page}
              TableView={TableView}
              Echart={Echart}
              baseUrl={baseUrl}
              pageProps={pageProps}
              apis={apis}
              initialData={data}
              reload={reload}
            />
          );
        }}
      />
    );
  })
);

export default Dashboard;
