import { Tag } from 'antd';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import { MESSAGE_TYPE_COLORS } from './enums';
import Actions from './Actions';

const renderEnumTag = ({ formatMessage, value, moduleName }) => {
  if (moduleName === 'messageManagerType') {
    return <Tag color={MESSAGE_TYPE_COLORS[value] || 'default'}>{formatMessage({ id: Number(value) === 1 ? 'SMS' : 'Email' })}</Tag>;
  }
  if (moduleName === 'messageTemplateLevel') {
    return <Tag color={Number(value) === 1 ? 'purple' : 'blue'}>{formatMessage({ id: Number(value) === 1 ? 'Business' : 'System' })}</Tag>;
  }
  return <Tag color={Number(value) === 1 ? 'default' : 'green'}>{formatMessage({ id: Number(value) === 1 ? 'Disabled' : 'Enabled' })}</Tag>;
};

const getTemplateColumns = ({ formatMessage, onSuccess }) => [
  { name: 'name', title: formatMessage({ id: 'Name' }), renderType: 'main' },
  { name: 'code', title: formatMessage({ id: 'Code' }) },
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
  { name: 'createdAt', title: formatMessage({ id: 'CreatedAt' }), format: 'datetime' },
  {
    name: 'options',
    title: formatMessage({ id: 'Operation' }),
    renderType: 'options',
    fixed: 'right',
    getValueOf: item => ({
      children: <Actions type="link" detailType="template" data={item} onSuccess={onSuccess} />
    })
  }
];

const getRecordColumns = ({ formatMessage, onSuccess }) => [
  { name: 'name', title: formatMessage({ id: 'Target' }), renderType: 'main' },
  { name: 'code', title: formatMessage({ id: 'Code' }) },
  {
    name: 'type',
    title: formatMessage({ id: 'Type' }),
    getValueOf: item => renderEnumTag({ formatMessage, value: item.type, moduleName: 'messageManagerType' })
  },
  { name: 'templateId', title: formatMessage({ id: 'TemplateId' }) },
  { name: 'createdAt', title: formatMessage({ id: 'CreatedAt' }), format: 'datetime' },
  {
    name: 'options',
    title: formatMessage({ id: 'Operation' }),
    renderType: 'options',
    fixed: 'right',
    getValueOf: item => ({
      children: <Actions type="link" detailType="record" data={item} onSuccess={onSuccess} />
    })
  }
];

export const TemplateColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getTemplateColumns(Object.assign({}, props, { formatMessage })));
});

export const RecordColumnsLoader = withLocale(({ children }) => {
  const { formatMessage } = useIntl();
  return children(props => getRecordColumns(Object.assign({}, props, { formatMessage })));
});

export { getTemplateColumns, getRecordColumns, renderEnumTag };
export default getTemplateColumns;
