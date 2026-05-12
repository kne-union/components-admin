import { Descriptions, Space, Tag } from 'antd';
import { useIntl } from '@kne/react-intl';
import dayjs from 'dayjs';
import withLocale from '../withLocale';
import { MESSAGE_TYPE_COLORS } from '../enums';
import PropsView from './PropsView';
import EmailContent from './EmailContent';
import SmsContent from './SmsContent';

const DetailContent = withLocale(({ data, type }) => {
  const { formatMessage } = useIntl();
  const isRecord = type === 'record';
  const isEmail = Number(data?.type) === 0;
  const content = data?.content || {};
  const props = data?.props || {};

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label={formatMessage({ id: 'ID' })}>{data?.id}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'Code' })}>{data?.code || '-'}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: isRecord ? 'Target' : 'Name' })}>{data?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'Type' })}>
          <Tag color={MESSAGE_TYPE_COLORS[data?.type] || 'default'}>{formatMessage({ id: Number(data?.type) === 1 ? 'SMS' : 'Email' })}</Tag>
        </Descriptions.Item>
        {isRecord ? <Descriptions.Item label={formatMessage({ id: 'TemplateId' })} span={2}>{data?.templateId || '-'}</Descriptions.Item> : null}
        {!isRecord ? <Descriptions.Item label={formatMessage({ id: 'Level' })}>{formatMessage({ id: Number(data?.level) === 1 ? 'Business' : 'System' })}</Descriptions.Item> : null}
        {!isRecord ? <Descriptions.Item label={formatMessage({ id: 'Status' })}>{formatMessage({ id: Number(data?.status) === 1 ? 'Disabled' : 'Enabled' })}</Descriptions.Item> : null}
        <Descriptions.Item label={formatMessage({ id: 'CreatedAt' })} span={isRecord ? 2 : 1}>{data?.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
      </Descriptions>
      {isRecord ? (
        <>
          <PropsView props={props} formatMessage={formatMessage} />
          {Object.keys(content).length > 0 && (
            <div>
              <strong>{formatMessage({ id: 'Content' })}</strong>
              <div style={{ marginTop: 8 }}>
                {isEmail ? (
                  <EmailContent content={content} formatMessage={formatMessage} />
                ) : (
                  <SmsContent content={content} formatMessage={formatMessage} />
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <strong>{formatMessage({ id: 'Content' })}</strong>
          <pre style={{ marginTop: 8, padding: 12, background: '#f5f5f5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{data?.content || '-'}</pre>
        </div>
      )}
    </Space>
  );
});

export default DetailContent;
