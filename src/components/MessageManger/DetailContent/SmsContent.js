import JsonView from '@kne/json-view';
import PlainTextView from './PlainTextView';

const SmsContent = ({ content, formatMessage }) => {
  const smsText = content?.content?.text;
  const signature = content?.content?.signature;

  return (
    <>
      {smsText && <PlainTextView text={smsText} />}
      {signature && (
        <div style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
          {formatMessage({ id: 'Signature' })}: {signature}
        </div>
      )}
      {content?.result && (
        <div style={{ marginTop: 12 }}>
          <strong>{formatMessage({ id: 'Result' })}</strong>
          <div style={{ marginTop: 8 }}>
            <JsonView theme="light" data={(() => { try { return JSON.parse(content.result); } catch { return content.result; } })()} collapsedFrom={1} />
          </div>
        </div>
      )}
    </>
  );
};

export default SmsContent;
