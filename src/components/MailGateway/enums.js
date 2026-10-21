import { createFormatMessage } from './withLocale';

const createEnum =
  list =>
  ({ locale }) => {
    const formatMessage = createFormatMessage(locale);
    return list.map(({ id, ...item }) => Object.assign({}, item, { description: formatMessage({ id }) }));
  };

const mailFolder = createEnum([
  { value: 'inbox', id: 'Inbox' },
  { value: 'sent', id: 'Sent' },
  { value: 'draft', id: 'Draft' },
  { value: 'trash', id: 'Trash' }
]);

const mailAccountStatus = createEnum([
  { value: 'enabled', id: 'Enabled', type: 'success' },
  { value: 'disabled', id: 'Disabled', type: 'default' }
]);

const mailRuleDirection = createEnum([
  { value: 'receive', id: 'DirectionReceive', type: 'info' },
  { value: 'beforeSend', id: 'DirectionBeforeSend', type: 'progress' },
  { value: 'send', id: 'DirectionSend', type: 'other' }
]);

const mailRuleStatus = createEnum([
  { value: 'enabled', id: 'Enabled', type: 'success' },
  { value: 'disabled', id: 'Disabled', type: 'default' }
]);

const mailTemplateStatus = createEnum([
  { value: 'enabled', id: 'Enabled', type: 'success' },
  { value: 'disabled', id: 'Disabled', type: 'default' }
]);

const mailTemplateLevel = createEnum([
  { value: 0, id: 'LevelSystem', type: 'info' },
  { value: 1, id: 'LevelCustom', type: 'default' }
]);

const mailRuleLogStatus = createEnum([
  { value: 'success', id: 'LogSuccess', type: 'success' },
  { value: 'partial', id: 'LogPartial', type: 'progress' },
  { value: 'failed', id: 'LogFailed', type: 'danger' }
]);

const mailConditionField = createEnum([
  { value: 'from', id: 'FieldFrom' },
  { value: 'to', id: 'FieldTo' },
  { value: 'cc', id: 'FieldCc' },
  { value: 'subject', id: 'FieldSubject' },
  { value: 'text', id: 'FieldText' },
  { value: 'hasAttachment', id: 'FieldHasAttachment' },
  { value: 'accountId', id: 'FieldAccountId' }
]);

const mailConditionOperator = createEnum([
  { value: 'contains', id: 'OperatorContains' },
  { value: 'notContains', id: 'OperatorNotContains' },
  { value: 'equals', id: 'OperatorEquals' },
  { value: 'startsWith', id: 'OperatorStartsWith' },
  { value: 'endsWith', id: 'OperatorEndsWith' },
  { value: 'regex', id: 'OperatorRegex' }
]);

const enums = {
  mailFolder,
  mailAccountStatus,
  mailRuleDirection,
  mailRuleStatus,
  mailTemplateStatus,
  mailTemplateLevel,
  mailRuleLogStatus,
  mailConditionField,
  mailConditionOperator
};

export default enums;
