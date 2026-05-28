import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Row, Space, Statistic, Table, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Menu from '../Menu';
import { buildUrlWithParams, formatPercent, formatRate, getMetricTotal } from '../utils';
import useManagedEventSource from '../../../utils/useManagedEventSource';

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

const DashboardContent = withLocale(({ Page, baseUrl, pageProps, apis, initialData, reload }) => {
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

  return (
    <Page
      {...pageProps}
      title={formatMessage({ id: 'Dashboard' })}
      menu={<Menu baseUrl={baseUrl} />}
      titleExtra={
        <Space>
          <Tag color={isConnected ? 'green' : 'default'}>{formatMessage({ id: isConnected ? 'RealtimeConnected' : 'RealtimeDisconnected' })}</Tag>
          {lastUpdatedAt ? <span>{`${formatMessage({ id: 'LastUpdatedAt' })}: ${new Date(lastUpdatedAt).toLocaleString()}`}</span> : null}
          <Button type="link" icon={<ReloadOutlined />} onClick={reload}>
            {formatMessage({ id: 'Refresh' })}
          </Button>
        </Space>
      }
      children={
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title={formatMessage({ id: 'QueueDepth' })} value={getMetricTotal(current.queueDepth)} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title={formatMessage({ id: 'ConsumedTotal' })} value={getMetricTotal(current.consumedTotal)} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={formatMessage({ id: 'FailedTotal' })}
                  value={getMetricTotal(current.failedTotal)}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title={formatMessage({ id: 'DLQTotal' })} value={getMetricTotal(current.dlqTotal)} valueStyle={{ color: '#faad14' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title={formatMessage({ id: 'ConsumeRate' })} value={formatRate(current.consumeRate?.total)} suffix="/s" />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={formatMessage({ id: 'FailureRate' })}
                  value={formatRate(current.failureRate?.total)}
                  suffix="/s"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={formatMessage({ id: 'DLQRate' })}
                  value={formatRate(current.dlqRate?.total)}
                  suffix="/s"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={formatMessage({ id: 'SuccessRatio' })}
                  value={formatPercent(current.successRatio)}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
          </Row>
          <Table
            style={{ marginTop: 16 }}
            bordered
            rowKey="topic"
            size="small"
            pagination={false}
            dataSource={rows}
            columns={[
              { title: formatMessage({ id: 'Topic' }), dataIndex: 'topic' },
              { title: formatMessage({ id: 'QueueDepth' }), dataIndex: 'queueDepth' },
              { title: formatMessage({ id: 'ConsumedTotal' }), dataIndex: 'consumedTotal' },
              { title: formatMessage({ id: 'FailedTotal' }), dataIndex: 'failedTotal' },
              { title: formatMessage({ id: 'DLQTotal' }), dataIndex: 'dlqTotal' },
              { title: formatMessage({ id: 'ConsumeRate' }), dataIndex: 'consumeRate', render: value => `${formatRate(value)}/s` },
              { title: formatMessage({ id: 'FailureRate' }), dataIndex: 'failureRate', render: value => `${formatRate(value)}/s` },
              { title: formatMessage({ id: 'SuccessRatio' }), dataIndex: 'successRatio', render: formatPercent }
            ]}
          />
        </>
      }
    />
  );
});

const Dashboard = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@Page']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Page] = remoteModules;
    const { apis } = usePreset();

    return (
      <Fetch
        {...apis.mq.dashboard.getData}
        render={({ data, reload }) => {
          return <DashboardContent Page={Page} baseUrl={baseUrl} pageProps={pageProps} apis={apis} initialData={data} reload={reload} />;
        }}
      />
    );
  })
);

export default Dashboard;
