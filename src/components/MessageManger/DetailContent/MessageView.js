import { useState } from 'react';
import { Segmented } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import HtmlPreview from './HtmlPreview';
import style from '../style.module.scss';

const SMS_SINGLE_LENGTH = 70;
const SMS_MULTI_LENGTH = 67;

/** 按 70 字一条、长短信每条 67 字估算计费条数 */
export const getSmsSegments = text => {
  const length = Array.from(text || '').length;
  if (length === 0) {
    return 0;
  }
  return length <= SMS_SINGLE_LENGTH ? 1 : Math.ceil(length / SMS_MULTI_LENGTH);
};

const formatAddress = value => {
  if (!value) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map(formatAddress).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    return value.name && value.address ? `${value.name} <${value.address}>` : value.address || value.name || '';
  }
  return String(value);
};

const MailView = ({ subject, from, to, attachments, html, text }) => {
  const { formatMessage } = useIntl();
  const modes = [html ? 'html' : null, text ? 'text' : null].filter(Boolean);
  const [mode, setMode] = useState(modes[0] || 'html');
  const current = modes.includes(mode) ? mode : modes[0];
  const metaRows = [
    { key: 'from', label: formatMessage({ id: 'From' }), value: formatAddress(from) },
    { key: 'to', label: formatMessage({ id: 'To' }), value: formatAddress(to) },
    {
      key: 'attachments',
      label: formatMessage({ id: 'Attachments' }),
      value: (Array.isArray(attachments) ? attachments : [])
        .map(item => item?.filename || item?.name || item?.path)
        .filter(Boolean)
        .join(', ')
    }
  ].filter(item => item.value);

  return (
    <div className={style['mail']}>
      <div className={style['mail-header']}>
        <div className={style['mail-subject']}>{subject || formatMessage({ id: 'NoSubject' })}</div>
        {metaRows.map(item => (
          <div key={item.key} className={style['mail-meta-row']}>
            <span className={style['mail-meta-label']}>{item.label}</span>
            <span>{item.value}</span>
          </div>
        ))}
        {modes.length > 1 && (
          <div className={style['mail-toolbar']}>
            <Segmented
              size="small"
              value={current}
              onChange={setMode}
              options={[
                { label: formatMessage({ id: 'HtmlPreview' }), value: 'html' },
                { label: formatMessage({ id: 'PlainText' }), value: 'text' }
              ]}
            />
          </div>
        )}
      </div>
      {current === 'html' && html ? <HtmlPreview html={html} bordered={false} /> : null}
      {current === 'text' && text ? <pre className={style['mail-text']}>{text}</pre> : null}
    </div>
  );
};

const SmsView = ({ text, signature }) => {
  const { formatMessage } = useIntl();
  const content = signature ? `【${signature}】${text || ''}` : text || '';
  return (
    <div className={style['sms']}>
      <div className={style['sms-bubble']}>{content}</div>
      <div className={style['sms-footer']}>
        {formatMessage({ id: 'SmsCount' }, { count: Array.from(content).length, segments: getSmsSegments(content) })}
      </div>
    </div>
  );
};

/** 渲染后的消息：邮件为邮件卡片（可切换 HTML / 纯文本），短信为短信气泡 */
const MessageView = withLocale(({ type, ...props }) => (Number(type) === 1 ? <SmsView {...props} /> : <MailView {...props} />));

export default MessageView;
