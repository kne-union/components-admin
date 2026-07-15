import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useIsMobile } from '@kne/responsive-utils';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Statistic, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Menu from '../Menu';
import { buildUrlWithParams, formatPercent, formatRate, getMetricTotal } from '../utils';
import useManagedEventSource from '../../../utils/useManagedEventSource';
import style from './dashboard.module.scss';

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

const DashboardContent = withLocale(({ Page, TableView, baseUrl, pageProps, apis, initialData, reload }) => {
  const { formatMessage } = useIntl();
  const isMobile = useIsMobile();
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

  const topicColumns = useMemo(
    () => [
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
    ],
    [formatMessage]
  );

  const kpiItems = [
    { key: 'queueDepth', title: formatMessage({ id: 'QueueDepth' }), value: getMetricTotal(current.queueDepth) },
    { key: 'consumedTotal', title: formatMessage({ id: 'ConsumedTotal' }), value: getMetricTotal(current.consumedTotal) },
    {
      key: 'failedTotal',
      title: formatMessage({ id: 'FailedTotal' }),
      value: getMetricTotal(current.failedTotal),
      valueStyle: { color: '#cf1322' }
    },
    {
      key: 'dlqTotal',
      title: formatMessage({ id: 'DLQTotal' }),
      value: getMetricTotal(current.dlqTotal),
      valueStyle: { color: '#faad14' }
    },
    {
      key: 'consumeRate',
      title: formatMessage({ id: 'ConsumeRate' }),
      value: formatRate(current.consumeRate?.total),
      suffix: '/s'
    },
    {
      key: 'failureRate',
      title: formatMessage({ id: 'FailureRate' }),
      value: formatRate(current.failureRate?.total),
      suffix: '/s',
      valueStyle: { color: '#cf1322' }
    },
    {
      key: 'dlqRate',
      title: formatMessage({ id: 'DLQRate' }),
      value: formatRate(current.dlqRate?.total),
      suffix: '/s',
      valueStyle: { color: '#faad14' }
    },
    {
      key: 'successRatio',
      title: formatMessage({ id: 'SuccessRatio' }),
      value: formatPercent(current.successRatio),
      valueStyle: { color: '#3f8600' }
    }
  ];

  return (
    <Page
      {...pageProps}
      title={formatMessage({ id: 'Dashboard' })}
      menu={<Menu baseUrl={baseUrl} />}
      titleExtra={
        <div className={style.titleExtra}>
          <Tag color={isConnected ? 'green' : 'default'}>{formatMessage({ id: isConnected ? 'RealtimeConnected' : 'RealtimeDisconnected' })}</Tag>
          {lastUpdatedAt ? (
            <span className={style.titleExtraMeta}>{`${formatMessage({ id: 'LastUpdatedAt' })}: ${new Date(lastUpdatedAt).toLocaleString()}`}</span>
          ) : null}
          <Button type="link" icon={<ReloadOutlined />} onClick={reload}>
            {formatMessage({ id: 'Refresh' })}
          </Button>
        </div>
      }
      children={
        <div className={style.dashboardRoot}>
          <div className={style.kpiRow}>
            {kpiItems.map(item => (
              <Card key={item.key} className={style.kpiCard} size={isMobile ? 'small' : 'default'}>
                <Statistic title={item.title} value={item.value} suffix={item.suffix} valueStyle={item.valueStyle} />
              </Card>
            ))}
          </div>
          <div className={style.topicTable}>
            <TableView rowKey="topic" size="small" dataSource={rows} columns={topicColumns} renderMobile />
          </div>
        </div>
      }
    />
  );
});

const Dashboard = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@Page', 'components-core:TablePage@TableView']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Page, TableView] = remoteModules;
    const { apis } = usePreset();

    return (
      <Fetch
        {...apis.mq.dashboard.getData}
        render={({ data, reload }) => {
          return (
            <DashboardContent
              Page={Page}
              TableView={TableView}
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
