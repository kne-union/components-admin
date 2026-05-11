import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import { parseIsoDateTimeInput, parseJsonInput, parseNumberInput } from '../utils';

const PublishMessage = createWithRemoteLoader({
  modules: [
    'components-core:FormInfo',
    'components-core:FormInfo@useFormModal',
    'components-core:Global@usePreset',
    'components-thirdparty:JSONEditor'
  ]
})(
  withLocale(({ remoteModules, onSuccess, ...props }) => {
    const [FormInfo, useFormModal, usePreset, JSONEditor] = remoteModules;
    const { Input, InputNumber,DatePicker } = FormInfo.fields;
    const formModal = useFormModal();
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();

    return (
      <Button
        type="primary"
        {...props}
        onClick={() => {
          const modalApi = formModal({
            title: formatMessage({ id: 'PublishMessage' }),
            size: 'small',
            formProps: {
              data: {
                priority: 0,
                maxRetries: 3,
                payload: '{}',
                meta: '{}'
              },
              onSubmit: async formData => {
                let payload;
                let meta;
                let priority;
                let maxRetries;
                let executeAt;
                try {
                  payload = parseJsonInput(formData.payload, 'payload');
                  meta = parseJsonInput(formData.meta, 'meta');
                  priority = parseNumberInput(formData.priority, 'priority', 0);
                  maxRetries = parseNumberInput(formData.maxRetries, 'maxRetries', 3);
                  executeAt = parseIsoDateTimeInput(formData.executeAt, 'executeAt');
                } catch (error) {
                  message.error(error.message);
                  return false;
                }

                const requestData = {
                  topic: formData.topic,
                  payload,
                  priority,
                  maxRetries
                };

                if (executeAt) {
                  requestData.executeAt = executeAt;
                }
                if (formData.traceId) {
                  requestData.traceId = formData.traceId;
                }
                if (meta && Object.keys(meta).length > 0) {
                  requestData.meta = meta;
                }

                const { data: resData } = await ajax(
                  Object.assign({}, apis.mq.message.publish, {
                    data: requestData
                  })
                );

                if (resData.code !== 0) {
                  return false;
                }
                message.success(formatMessage({ id: 'PublishSuccess' }));
                onSuccess && onSuccess();
                modalApi.close();
              }
            },
            children: (
              <FormInfo
                column={1}
                list={[
                  <Input name="topic" label={formatMessage({ id: 'Topic' })} rule="REQ" placeholder={formatMessage({ id: 'TopicPlaceholder' })} />,
                  <JSONEditor name="payload" label={formatMessage({ id: 'Payload' })} rule="REQ" />,
                  <InputNumber name="priority" label={formatMessage({ id: 'Priority' })} />,
                  <InputNumber name="maxRetries" label={formatMessage({ id: 'MaxRetries' })} />,
                  <DatePicker showTime name="executeAt" label={formatMessage({ id: 'ExecuteAt' })} />,
                  <Input name="traceId" label={formatMessage({ id: 'TraceId' })} />,
                  <JSONEditor name="meta" label={formatMessage({ id: 'Meta' })} placeholder={formatMessage({ id: 'InputJsonPlaceholder' })} />
                ]}
              />
            )
          });
        }}>
        {formatMessage({ id: 'PublishMessage' })}
      </Button>
    );
  })
);

export default PublishMessage;
