import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App, Button, Tag, Flex } from 'antd';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';

import { SOURCE_LABEL_MAP } from '../../constants';

const SendMessage = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:FormInfo', 'components-admin:Editor', 'components-core:Global@usePreset']
})(({ remoteModules, apis, selectedRows, onSuccess, size }) => {
  const [useFormModal, FormInfo, Editor, usePreset] = remoteModules;
  const { ajax } = usePreset();
  const formModal = useFormModal();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();

  const externalUsers = selectedRows.filter(row => row.syncSource && row.sourceId);
  const syncSource = externalUsers.length > 0 ? externalUsers[0].syncSource : null;
  const sourceLabel = SOURCE_LABEL_MAP[syncSource] || syncSource || '';

  const { TextArea, RadioGroup, Input } = FormInfo.fields;

  const handleClick = () => {
    if (externalUsers.length === 0) {
      return;
    }

    formModal({
      title: formatMessage({ id: 'SendOrgMessageTitle' }, { type: sourceLabel }),
      size: 'small',
      formProps: {
        onSubmit: async formData => {
          const { data: resData } = await ajax(
            merge({}, apis.sendOrgMessage, {
              data: {
                userIds: externalUsers.map(u => String(u.id)),
                content: formData.content,
                msgtype: formData.msgtype
              }
            })
          );
          if (resData.code !== 0) {
            return false;
          }
          message.success(formatMessage({ id: 'SendMessageSuccess' }, { count: externalUsers.length }));
          onSuccess?.();
        }
      },
      children: (
        <Flex vertical>
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 4, color: '#666' }}>
              {formatMessage({ id: 'SendMessageTarget' })}（{externalUsers.length}）
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {externalUsers.map(u => (
                <Tag key={u.id}>{u.name}</Tag>
              ))}
            </div>
          </div>
          <FormInfo
            list={[
              <RadioGroup
                name="msgtype"
                label={formatMessage({ id: 'SendMessageType' })}
                options={[
                  {
                    label: formatMessage({ id: 'SendMessageTypeText' }),
                    value: 'text'
                  },
                  { label: formatMessage({ id: 'SendMessageTypeMarkdown' }), value: 'markdown' }
                ]}
                defaultValue="text"
              />,
              <TextArea
                name="content.content"
                label={formatMessage({ id: 'SendMessageContent' })}
                rule="REQ"
                block
                display={({ formData }) => formData.msgtype === 'text'}
                maxLength={2048}
                showCount
              />,
              <Input name="content.title" label="标题" rule="REQ LEN-0-100" block display={({ formData }) => formData.msgtype === 'markdown'} />,
              <Editor
                name="content.content"
                label={formatMessage({ id: 'SendMessageContent' })}
                rule="REQ"
                block
                isMarkdown
                display={({ formData }) => formData.msgtype === 'markdown'}
              />
            ]}
          />
        </Flex>
      )
    });
  };

  return (
    <Button size={size} disabled={externalUsers.length === 0} onClick={handleClick}>
      {formatMessage({ id: 'SendOrgMessage' }, { type: sourceLabel })}
    </Button>
  );
});

export default withLocale(SendMessage);
