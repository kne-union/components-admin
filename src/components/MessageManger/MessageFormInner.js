import { createWithRemoteLoader } from '@kne/remote-loader';
import { Alert } from 'antd';
import { useIntl } from '@kne/react-intl';

const extractVariables = content => {
  if (!content || typeof content !== 'string') return [];
  const matches = content.matchAll(/\{\{(\w+)\}\}/g);
  return [...new Set(Array.from(matches, m => m[1]))];
};

const MessageFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-thirdparty:JSONEditor']
})(({ remoteModules, data }) => {
  const [FormInfo, JSONEditor] = remoteModules;
  const { fields } = FormInfo;
  const { Input, PhoneNumber } = fields;
  const { formatMessage } = useIntl();
  const isSMS = data.type === 1;
  const contentStr = typeof data.content === 'string' ? data.content : '';
  const variables = extractVariables(contentStr);
  const propsExample = variables.length > 0 ? Object.fromEntries(variables.map(key => [key, ''])) : {};

  return (
    <>
      <FormInfo
        column={1}
        list={[
          isSMS ? (
            <PhoneNumber name="name" label={formatMessage({ id: 'PhoneNumber' })} rule="REQ" format="string" />
          ) : (
            <Input name="name" label={formatMessage({ id: 'EmailAddress' })} rule="REQ" />
          )
        ]}
      />
      {contentStr ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 4, fontWeight: 600, fontSize: 14 }}>{formatMessage({ id: 'TemplateContent' })}</div>
          <pre
            style={{
              margin: 0,
              padding: 8,
              background: '#f5f5f5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: 12,
              maxHeight: 200,
              overflow: 'auto'
            }}>
            {contentStr}
          </pre>
        </div>
      ) : null}
      {variables.length > 0 ? (
        <Alert
          type="info"
          message={formatMessage({ id: 'PropsTip' }, { example: JSON.stringify(propsExample, null, 2) })}
          style={{ marginBottom: 16 }}
        />
      ) : null}
      <FormInfo
        column={1}
        list={[<JSONEditor name="props" label={formatMessage({ id: 'Props' })} placeholder={formatMessage({ id: 'PropsPlaceholder' })} />]}
      />
    </>
  );
});

export default MessageFormInner;
