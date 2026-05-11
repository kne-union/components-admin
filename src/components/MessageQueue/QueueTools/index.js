import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button, Card, Input, Select, Space, Statistic } from 'antd';
import { useState } from 'react';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Menu from '../Menu';

const QueueTools = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@Page', 'components-core:ConfirmButton']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Page, ConfirmButton] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const [topic, setTopic] = useState('');
    const [depth, setDepth] = useState(null);
    const [cleanupStatus, setCleanupStatus] = useState('COMPLETED');
    const [olderThan, setOlderThan] = useState('');

    const queryDepth = async () => {
      const { data: resData } = await ajax(
        Object.assign({}, apis.mq.queue.depth, {
          params: topic ? { topic } : {}
        })
      );
      if (resData.code !== 0) {
        return;
      }
      setDepth(resData.data?.depth || 0);
    };

    return (
      <Page
        {...pageProps}
        title={formatMessage({ id: 'QueueTools' })}
        menu={<Menu baseUrl={baseUrl} />}
        children={
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title={formatMessage({ id: 'QueryDepth' })}>
              <Space wrap>
                <Input value={topic} onChange={event => setTopic(event.target.value)} placeholder={formatMessage({ id: 'TopicPlaceholder' })} style={{ width: 280 }} />
                <Button type="primary" onClick={queryDepth}>
                  {formatMessage({ id: 'QueryDepth' })}
                </Button>
              </Space>
              {depth !== null && <Statistic style={{ marginTop: 16 }} title={formatMessage({ id: 'DepthResult' })} value={depth} />}
            </Card>
            <Card title={formatMessage({ id: 'CleanupMessages' })}>
              <Space wrap>
                <Select
                  value={cleanupStatus}
                  onChange={setCleanupStatus}
                  style={{ width: 180 }}
                  options={[
                    { label: formatMessage({ id: 'COMPLETED' }), value: 'COMPLETED' },
                    { label: formatMessage({ id: 'FAILED' }), value: 'FAILED' }
                  ]}
                />
                <Input value={olderThan} onChange={event => setOlderThan(event.target.value)} placeholder={`${formatMessage({ id: 'OlderThan' })}: 2026-05-01T00:00:00.000Z`} style={{ width: 320 }} />
                <ConfirmButton
                  type="primary"
                  danger
                  message={formatMessage({ id: 'CleanupConfirm' })}
                  onClick={async () => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.mq.queue.cleanup, {
                        data: Object.assign(
                          {
                            status: cleanupStatus
                          },
                          olderThan ? { olderThan } : {}
                        )
                      })
                    );
                    if (resData.code !== 0) {
                      return;
                    }
                    message.success(formatMessage({ id: 'CleanupSuccess' }));
                  }}>
                  {formatMessage({ id: 'CleanupMessages' })}
                </ConfirmButton>
              </Space>
            </Card>
          </Space>
        }
      />
    );
  })
);

export default QueueTools;
