import { Tag, Typography } from 'antd';
import { formatDateTime } from '../MailGateway/CardList';
import enums from './enums';
import { stringifyJson } from './utils';

const ENUM_TAG_COLOR = { success: 'success', danger: 'error', progress: 'warning', info: 'processing' };

const renderEnumTag = ({ formatMessage, moduleName, value }) => {
  const target = (enums[moduleName] || []).find(item => item.value === value);
  if (!target) return value ? <Tag>{String(value)}</Tag> : null;
  return <Tag color={ENUM_TAG_COLOR[target.type] || 'default'}>{formatMessage({ id: String(value), defaultMessage: target.description })}</Tag>;
};

const renderTopic = topic => (topic ? <Tag color="blue">{topic}</Tag> : null);

const renderPreview = value => {
  const text = stringifyJson(value);
  return text ? (
    <Typography.Text type="secondary" ellipsis={{ tooltip: text }}>
      {text}
    </Typography.Text>
  ) : null;
};

export const getMessageCardItem =
  ({ formatMessage }) =>
  item => ({
    title: item.topic,
    extra: renderEnumTag({ formatMessage, moduleName: 'messageStatus', value: item.status }),
    subtitle: `${formatMessage({ id: 'ID' })}：${item.id}`,
    description: renderPreview(item.payload),
    fields: [
      { label: formatMessage({ id: 'RetryCount' }), value: `${item.retryCount ?? 0} / ${item.maxRetries ?? '-'}` },
      { label: formatMessage({ id: 'Priority' }), value: item.priority },
      { label: formatMessage({ id: 'ExecuteAt' }), value: formatDateTime(item.executeAt) },
      { label: formatMessage({ id: 'CreatedAt' }), value: formatDateTime(item.createdAt) }
    ]
  });

export const getDeadLetterCardItem =
  ({ formatMessage }) =>
  item => ({
    title: item.topic,
    extra: item.replayed ? <Tag color="success">{formatMessage({ id: 'Replayed' })}</Tag> : <Tag>{formatMessage({ id: 'NotReplayed' })}</Tag>,
    subtitle: `${formatMessage({ id: 'OriginalMessageId' })}：${item.originalId || '-'}`,
    description: item.errorMessage ? <Typography.Text type="danger">{item.errorMessage}</Typography.Text> : renderPreview(item.payload),
    muted: !!item.replayed,
    fields: [
      { label: formatMessage({ id: 'CreatedAt' }), value: formatDateTime(item.createdAt) },
      { label: formatMessage({ id: 'ReplayedAt' }), value: formatDateTime(item.replayedAt) }
    ]
  });

export const getTraceCardItem =
  ({ formatMessage }) =>
  item => ({
    title: renderEnumTag({ formatMessage, moduleName: 'traceEvent', value: item.event }),
    extra: renderTopic(item.topic),
    subtitle: `${formatMessage({ id: 'MessageId' })}：${item.messageId || '-'}`,
    description: renderPreview(item.detail),
    fields: [
      { label: formatMessage({ id: 'TraceId' }), value: item.traceId },
      { label: formatMessage({ id: 'CreatedAt' }), value: formatDateTime(item.createdAt) }
    ]
  });
