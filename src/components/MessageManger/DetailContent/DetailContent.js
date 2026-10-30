import { Alert, Empty, Flex, Tabs, Tag, Typography } from 'antd';
import JsonView from '@kne/json-view';
import { useIntl } from '@kne/react-intl';
import dayjs from 'dayjs';
import withLocale from '../withLocale';
import { MESSAGE_TYPE_COLORS } from '../enums';
import { getTemplateVariables } from '../utils';
import SummaryHeader from './SummaryHeader';
import MessageView from './MessageView';
import VariableTable from './VariableTable';
import TemplateContent from './TemplateContent';

const RECORD_STATUS = {
  0: { id: 'StatusSuccess', color: 'success' },
  1: { id: 'StatusFailed', color: 'error' },
  2: { id: 'StatusPending', color: 'warning' }
};

const formatTime = value => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-');

const copyable = value => (value ? <Typography.Text copyable={{ text: String(value) }}>{value}</Typography.Text> : '-');

const parseResult = value => {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

/** 发送记录 content → MessageView 参数；邮件为 nodemailer 参数，短信为 { content: { text, signature }, result } */
const toMessageViewProps = (type, content) => {
  if (Number(type) === 1) {
    return { type: 1, text: content?.content?.text ?? content?.text, signature: content?.content?.signature };
  }
  return {
    type: 0,
    subject: content.subject,
    from: content.from,
    to: content.to,
    attachments: content.attachments,
    html: content.html,
    text: content.text
  };
};

const TypeTag = ({ type, formatMessage }) => (
  <Tag color={MESSAGE_TYPE_COLORS[type] || 'default'}>{formatMessage({ id: Number(type) === 1 ? 'SMS' : 'EmailChannel' })}</Tag>
);

const TemplateDetail = ({ data, formatMessage }) => {
  const variables = getTemplateVariables(data);
  const disabled = Number(data?.status) === 1;
  return (
    <Flex vertical gap={16}>
      <SummaryHeader
        title={data?.name || data?.code}
        tags={
          <>
            <TypeTag type={data?.type} formatMessage={formatMessage} />
            <Tag color={Number(data?.level) === 1 ? 'purple' : 'blue'}>
              {formatMessage({ id: Number(data?.level) === 1 ? 'Business' : 'System' })}
            </Tag>
            <Tag color={disabled ? 'default' : 'green'}>{formatMessage({ id: disabled ? 'Disabled' : 'Enabled' })}</Tag>
          </>
        }
        description={data?.description}
        meta={[
          { key: 'code', label: formatMessage({ id: 'TemplateCode' }), value: copyable(data?.code) },
          { key: 'id', label: formatMessage({ id: 'TemplateId' }), value: copyable(data?.id) },
          { key: 'createdAt', label: formatMessage({ id: 'CreatedAt' }), value: formatTime(data?.createdAt) },
          { key: 'updatedAt', label: formatMessage({ id: 'UpdatedAt' }), value: formatTime(data?.updatedAt) }
        ]}
      />
      <Tabs
        items={[
          { key: 'content', label: formatMessage({ id: 'TemplateContent' }), children: <TemplateContent data={data} /> },
          {
            key: 'variables',
            label: `${formatMessage({ id: 'VariableList' })} (${variables.length})`,
            children: <VariableTable variables={variables} />
          }
        ]}
      />
    </Flex>
  );
};

const RecordDetail = ({ data, extra, formatMessage }) => {
  const status = RECORD_STATUS[data?.status];
  const content = data?.content || {};
  const hasContent = Object.keys(content).length > 0;
  const result = Number(data?.type) === 1 ? content.result : null;
  const props = data?.props || {};

  return (
    <Flex vertical gap={16}>
      <SummaryHeader
        title={data?.name || '-'}
        tags={
          <>
            <TypeTag type={data?.type} formatMessage={formatMessage} />
            {status ? <Tag color={status.color}>{formatMessage({ id: status.id })}</Tag> : null}
          </>
        }
        meta={[
          { key: 'code', label: formatMessage({ id: 'TemplateCode' }), value: copyable(data?.code) },
          { key: 'templateId', label: formatMessage({ id: 'TemplateId' }), value: copyable(data?.templateId) },
          { key: 'id', label: formatMessage({ id: 'RecordId' }), value: copyable(data?.id) },
          { key: 'createdAt', label: formatMessage({ id: 'SendTime' }), value: formatTime(data?.createdAt) },
          data?.retryCount ? { key: 'retryCount', label: formatMessage({ id: 'RetryCount' }), value: data.retryCount } : null
        ].filter(Boolean)}
      />
      {Number(data?.status) === 1 && data?.error ? (
        <Alert type="error" showIcon message={formatMessage({ id: 'ErrorReason' })} description={data.error} />
      ) : null}
      <Tabs
        tabBarExtraContent={extra}
        items={[
          {
            key: 'content',
            label: formatMessage({ id: 'SendContent' }),
            children: hasContent ? (
              <MessageView {...toMessageViewProps(data?.type, content)} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'NoSendContent' })} />
            )
          },
          {
            key: 'props',
            label: `${formatMessage({ id: 'Props' })} (${Object.keys(props).length})`,
            children: <VariableTable props={props} />
          },
          result
            ? {
                key: 'result',
                label: formatMessage({ id: 'Result' }),
                children: <JsonView theme="light" data={parseResult(result)} collapsedFrom={1} />
              }
            : null
        ].filter(Boolean)}
      />
    </Flex>
  );
};

const DetailContent = withLocale(({ data, type, extra }) => {
  const { formatMessage } = useIntl();
  return type === 'record' ? (
    <RecordDetail data={data} extra={extra} formatMessage={formatMessage} />
  ) : (
    <TemplateDetail data={data} formatMessage={formatMessage} />
  );
});

export default DetailContent;
