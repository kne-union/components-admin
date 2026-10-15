import enums from '../enums';

export const formatConditionItem = (item, { fieldMap, operatorMap, conditionMap }) =>
  item.type
    ? `「${conditionMap?.get(item.type)?.label || item.label || item.type}」`
    : `${fieldMap.get(item.field) || item.field} ${operatorMap.get(item.operator) || item.operator} "${item.value}"`;

export const createConditionMaps = ({ locale, conditionMap }) => ({
  fieldMap: new Map(enums.mailConditionField({ locale }).map(item => [item.value, item.description])),
  operatorMap: new Map(enums.mailConditionOperator({ locale }).map(item => [item.value, item.description])),
  conditionMap
});

export const formatConditions = (conditions, { formatMessage, locale, conditionMap }) => {
  const items = conditions?.items || [];
  if (items.length === 0) {
    return formatMessage({ id: 'AllMails' });
  }
  const maps = createConditionMaps({ locale, conditionMap });
  return items.map(item => formatConditionItem(item, maps)).join(formatMessage({ id: conditions.match === 'any' ? 'JoinOr' : 'JoinAnd' }));
};

const getColumns = ({ formatMessage, locale, accountMap, actionMap, conditionMap }) => [
  {
    name: 'name',
    title: formatMessage({ id: 'RuleName' }),
    renderType: 'main'
  },
  {
    name: 'direction',
    title: formatMessage({ id: 'Direction' }),
    width: 100,
    renderType: 'enum',
    moduleName: 'mailRuleDirection'
  },
  {
    name: 'accountIds',
    title: formatMessage({ id: 'ApplyAccounts' }),
    renderType: 'description',
    width: 200,
    getValueOf: item =>
      item.accountIds?.length ? item.accountIds.map(id => accountMap.get(String(id))?.name || id).join('、') : formatMessage({ id: 'AllAccounts' })
  },
  {
    name: 'conditions',
    title: formatMessage({ id: 'Conditions' }),
    renderType: 'description',
    width: 280,
    getValueOf: item => formatConditions(item.conditions, { formatMessage, locale, conditionMap })
  },
  {
    name: 'actions',
    title: formatMessage({ id: 'Actions' }),
    renderType: 'description',
    width: 240,
    getValueOf: item => (item.actions || []).map(action => actionMap.get(action.type)?.label || action.type).join(' → ')
  },
  {
    name: 'priority',
    title: formatMessage({ id: 'Priority' }),
    width: 80
  },
  {
    name: 'stopProcessing',
    title: formatMessage({ id: 'StopProcessing' }),
    width: 100,
    getValueOf: item => formatMessage({ id: item.stopProcessing ? 'Yes' : 'No' })
  },
  {
    name: 'status',
    title: formatMessage({ id: 'Status' }),
    width: 100,
    renderType: 'enum',
    moduleName: 'mailRuleStatus'
  }
];

export default getColumns;
