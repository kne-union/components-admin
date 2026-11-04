import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button, Flex, Input, Select } from 'antd';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { defaultColors } from '@kne/react-box';
import { useState } from 'react';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Menu from '../Menu';
import { Panel, Metric } from '../../../utils/dashboard/ui';
import dashboardStyle from '../../../utils/dashboard/dashboard.module.scss';
import style from '../style.module.scss';

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
    const [depthTopic, setDepthTopic] = useState('');
    const [cleanupStatus, setCleanupStatus] = useState('COMPLETED');
    const [olderThan, setOlderThan] = useState('');
    const [deleted, setDeleted] = useState(null);

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
      setDepthTopic(topic);
    };

    return (
      <Page
        {...pageProps}
        title={formatMessage({ id: 'QueueTools' })}
        menu={<Menu baseUrl={baseUrl} />}
        children={
          <div className={dashboardStyle.dashboardRoot}>
            <div className={dashboardStyle.section}>
              <div className={style['tools-grid']}>
                <Panel title={formatMessage({ id: 'QueryDepth' })} subtitle={formatMessage({ id: 'QueryDepthCaption' })}>
                  <Flex vertical gap={16}>
                    <Flex gap={8} wrap>
                      <Input
                        className={style['tools-input']}
                        allowClear
                        value={topic}
                        onChange={event => setTopic(event.target.value)}
                        onPressEnter={queryDepth}
                        placeholder={formatMessage({ id: 'TopicPlaceholder' })}
                      />
                      <Button type="primary" icon={<SearchOutlined />} onClick={queryDepth}>
                        {formatMessage({ id: 'QueryDepth' })}
                      </Button>
                    </Flex>
                    {depth !== null ? (
                      <Metric
                        card
                        label={formatMessage({ id: 'DepthResult' })}
                        value={depth.toLocaleString()}
                        hint={`${formatMessage({ id: 'Topic' })} ${depthTopic || formatMessage({ id: 'AllTopics' })}`}
                        state={depth > 0 ? defaultColors.Orange : undefined}
                      />
                    ) : null}
                  </Flex>
                </Panel>
                <Panel title={formatMessage({ id: 'CleanupMessages' })} subtitle={formatMessage({ id: 'CleanupCaption' })}>
                  <Flex vertical gap={16}>
                    <Flex gap={8} wrap>
                      <Select
                        className={style['tools-select']}
                        value={cleanupStatus}
                        onChange={setCleanupStatus}
                        options={[
                          { label: formatMessage({ id: 'COMPLETED' }), value: 'COMPLETED' },
                          { label: formatMessage({ id: 'FAILED' }), value: 'FAILED' }
                        ]}
                      />
                      <Input
                        className={style['tools-input']}
                        allowClear
                        value={olderThan}
                        onChange={event => setOlderThan(event.target.value)}
                        placeholder={`${formatMessage({ id: 'OlderThan' })}: 2026-05-01T00:00:00.000Z`}
                      />
                      <ConfirmButton
                        type="primary"
                        danger
                        icon={<ClearOutlined />}
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
                          setDeleted(resData.data?.deleted ?? null);
                          message.success(formatMessage({ id: 'CleanupSuccess' }));
                        }}>
                        {formatMessage({ id: 'CleanupMessages' })}
                      </ConfirmButton>
                    </Flex>
                    {deleted !== null ? <Metric card label={formatMessage({ id: 'CleanupResult' })} value={Number(deleted).toLocaleString()} /> : null}
                  </Flex>
                </Panel>
              </div>
            </div>
          </div>
        }
      />
    );
  })
);

export default QueueTools;
