import { Descriptions, Tabs } from 'antd';
import JsonView from '@kne/json-view';
import HtmlPreview from './HtmlPreview';
import PlainTextView from './PlainTextView';

const EmailContent = ({ content, formatMessage }) => {
  const items = [];
  if (content.subject) {
    items.push({ key: 'subject', label: formatMessage({ id: 'Subject' }), children: content.subject });
  }
  if (content.from) {
    items.push({ key: 'from', label: formatMessage({ id: 'From' }), children: content.from });
  }
  if (content.to) {
    items.push({ key: 'to', label: formatMessage({ id: 'To' }), children: content.to });
  }
  if (content.attachments && content.attachments.length > 0) {
    items.push({ key: 'attachments', label: formatMessage({ id: 'Attachments' }), children: <JsonView data={content.attachments} theme="light" collapsedFrom={1} /> });
  }

  const tabItems = [];
  if (content.html) {
    tabItems.push({ key: 'html', label: formatMessage({ id: 'HtmlPreview' }), children: <HtmlPreview html={content.html} /> });
  }
  if (content.text) {
    tabItems.push({ key: 'text', label: formatMessage({ id: 'PlainText' }), children: <PlainTextView text={content.text} /> });
  }

  return (
    <>
      {items.length > 0 && (
        <Descriptions bordered column={1} size="small">
          {items.map(item => (
            <Descriptions.Item key={item.key} label={item.label}>{item.children}</Descriptions.Item>
          ))}
        </Descriptions>
      )}
      {tabItems.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Tabs items={tabItems} size="small" />
        </div>
      )}
    </>
  );
};

export default EmailContent;
