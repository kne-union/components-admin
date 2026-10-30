import { Tag, Typography } from 'antd';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import { MESSAGE_TYPE_COLORS } from './enums';
import Actions from './Actions';
import { formatDateTime } from '@components/MailGateway/CardList';

const renderEnumTag = ({ formatMessage, value, moduleName }) => {
  if (moduleName === 'messageManagerType') {
    return <Tag color={MESSAGE_TYPE_COLORS[value] || 'default'}>{formatMessage({ id: Number(value) === 1 ? 'SMS' : 'EmailChannel' })}</Tag>;
  }
  if (moduleName === 'messageTemplateLevel') {
    return <Tag color={Number(value) === 1 ? 'purple' : 'blue'}>{formatMessage({ id: Number(value) === 1 ? 'Business' : 'System' })}</Tag>;
  }
  return <Tag color={Number(value) === 1 ? 'default' : 'green'}>{formatMessage({ id: Number(value) === 1 ? 'Disabled' : 'Enabled' })}</Tag>;
};

const getTemplateBaseColumns = ({ formatMessage, onPreview }) => [
  {
    name: 'name',
    title: formatMessage({ id: 'Name' }),
    renderType: 'main',
    render: (value, { dataSource }) =>
      typeof onPreview === 'function' ? (
        <Typography.Link
          onClick={e => {
            e.stopPropagation();
            onPreview(dataSource);
          }}
        >
          {value}
        </Typography.Link>
      ) : (
        value
      )
  },
  { name: 'code', title: formatMessage({ id: 'TemplateCode' }) },
  {
    name: 'type',
    title: formatMessage({ id: 'Type' }),
    getValueOf: item => renderEnumTag({ formatMessage, value: item.type, moduleName: 'messageManagerType' })
  },
  {
    name: 'level',
    title: formatMessage({ id: 'Level' }),
    getValueOf: item => renderEnumTag({ formatMessage, value: item.level, moduleName: 'messageTemplateLevel' })
  },
  {
    name: 'status',
    title: formatMessage({ id: 'Status' }),
    getValueOf: item => renderEnumTag({ formatMessage, value: item.status, moduleName: 'messageTemplateStatus' })
  },
  { name: 'subject', title: formatMessage({ id: 'Subject' }), renderType: 'description', width: 220 },
  { name: 'description', title: formatMessage({ id: 'Description' }), renderType: 'description', width: 220 },
  { name: 'updatedAt', title: formatMessage({ id: 'UpdatedAt' }), format: 'datetime' }
];

const getTemplateColumns = ({ formatMessage, onSuccess, onPreview }) => [
  ...getTemplateBaseColumns({ formatMessage, onPreview }),
  {
    name: 'options',
    title: formatMessage({ id: 'Action' }),
    renderType: 'options',
    fixed: 'right',
    getValueOf: item => ({
      children: <Actions type="link" detailType="template" data={item} onSuccess={onSuccess} />
    })
  }
];

const getRecordColumns = ({ formatMessage, onSuccess, onDetail }) => [
  {
    name: 'name',
    title: formatMessage({ id: 'Recipient' }),
    renderType: 'main',
    render: (value, { dataSource }) =>
      typeof onDetail === 'function' ? (
        <Typography.Link
          onClick={e => {
            e.stopPropagation();
            onDetail(dataSource);
          }}
        >
          {value}
        </Typography.Link>
      ) : (
        value
      )
  },
  { name: 'code', title: formatMessage({ id: 'TemplateCode' }) },
  {
    name: 'type',
    title: formatMessage({ id: 'Type' }),
    getValueOf: item => renderEnumTag({ formatMessage, value: item.type, moduleName: 'messageManagerType' })
  },
  { name: 'templateId', title: formatMessage({ id: 'TemplateId' }) },
  { name: 'createdAt', title: formatMessage({ id: 'CreatedAt' }), format: 'datetime' },
  {
    name: 'options',
    title: formatMessage({ id: 'Action' }),
    renderType: 'options',
    fixed: 'right',
    getValueOf: item => ({
      children: <Actions type="link" detailType="record" data={item} onSuccess={onSuccess} />
    })
  }
];

const renderLink = (value, onClick) =>
  typeof onClick === 'function' ? (
    <Typography.Link
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
    >
      {value}
    </Typography.Link>
  ) : (
    value
  );

/** 模板卡片（PC 卡片视图 / 移动端），操作按钮沿用表格操作列 */
const getTemplateCardItem =
  ({ formatMessage, onPreview }) =>
  item => ({
    title: renderLink(item.name, onPreview && (() => onPreview(item))),
    extra: (
      <>
        {renderEnumTag({ formatMessage, value: item.type, moduleName: 'messageManagerType' })}
        {renderEnumTag({ formatMessage, value: item.level, moduleName: 'messageTemplateLevel' })}
        {renderEnumTag({ formatMessage, value: item.status, moduleName: 'messageTemplateStatus' })}
      </>
    ),
    muted: Number(item.status) !== 0,
    subtitle: `${formatMessage({ id: 'TemplateCode' })}：${item.code}`,
    description: item.description,
    fields: item.subject ? [{ label: formatMessage({ id: 'Subject' }), value: item.subject }] : [],
    footer: item.updatedAt && `${formatMessage({ id: 'UpdatedAt' })} ${formatDateTime(item.updatedAt)}`
  });

/** 发送记录卡片（PC 卡片视图 / 移动端） */
const getRecordCardItem =
  ({ formatMessage, onDetail }) =>
  item => ({
    title: renderLink(item.name, onDetail && (() => onDetail(item))),
    extra: renderEnumTag({ formatMessage, value: item.type, moduleName: 'messageManagerType' }),
    subtitle: `${formatMessage({ id: 'TemplateCode' })}：${item.code}`,
    fields: [
      { label: formatMessage({ id: 'TemplateId' }), value: item.templateId },
      { label: formatMessage({ id: 'SendTime' }), value: formatDateTime(item.createdAt) }
    ]
  });

export const TemplateColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getTemplateColumns(Object.assign({}, props, { formatMessage })));
});

export const RecordColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getRecordColumns(Object.assign({}, props, { formatMessage })));
});

export { getTemplateBaseColumns, getTemplateColumns, getRecordColumns, renderEnumTag, getTemplateCardItem, getRecordCardItem };
export default getTemplateColumns;
