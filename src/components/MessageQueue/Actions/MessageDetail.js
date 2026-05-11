import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, Descriptions } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import JsonView from '@kne/json-view';
import '@kne/json-view/dist/index.css';

const MessageDetail = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, data, title, ...props }) => {
    const [useModal] = remoteModules;
    const modal = useModal();
    const { formatMessage } = useIntl();

    return (
      <Button
        {...props}
        onClick={() => {
          modal({
            title: title || formatMessage({ id: 'MessageDetail' }),
            width: 760,
            footer: null,
            children: (
              <>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label={formatMessage({ id: 'ID' })}>{data?.id}</Descriptions.Item>
                  <Descriptions.Item label={formatMessage({ id: 'Topic' })}>{data?.topic}</Descriptions.Item>
                  <Descriptions.Item label={formatMessage({ id: 'Status' })}>{data?.status || '-'}</Descriptions.Item>
                  <Descriptions.Item label={formatMessage({ id: 'TraceId' })}>{data?.traceId || '-'}</Descriptions.Item>
                  <Descriptions.Item label={formatMessage({ id: 'RetryCount' })}>{data?.retryCount ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label={formatMessage({ id: 'MaxRetries' })}>{data?.maxRetries ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label={formatMessage({ id: 'CreatedAt' })}>{data?.createdAt || '-'}</Descriptions.Item>
                  <Descriptions.Item label={formatMessage({ id: 'UpdatedAt' })}>{data?.updatedAt || '-'}</Descriptions.Item>
                </Descriptions>
                <div style={{ marginTop: 16 }}>
                  <JsonView data={data || {}} collapsedFrom={1} />
                </div>
              </>
            )
          });
        }}
      />
    );
  })
);

export default MessageDetail;
