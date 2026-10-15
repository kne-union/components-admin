import { createWithRemoteLoader } from '@kne/remote-loader';
import { useFetch } from '@kne/react-fetch';
import { useRef } from 'react';
import { Alert, Button, Flex, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import enums from '../enums';
import { AccountSelectField, ContactInputField } from '../fields';
import { registerMailActionFields } from './actionFields';
import style from '../style.module.scss';

const EQUALS_ONLY_FIELDS = ['hasAttachment', 'accountId'];
const ADDRESS_FIELDS = ['from', 'to', 'cc'];

const getValueKind = field => {
  if (field === 'hasAttachment' || field === 'accountId') {
    return field;
  }
  return ADDRESS_FIELDS.includes(field) ? 'address' : 'text';
};

const ConditionValueField = ({ FormInfo, field, operator, formatMessage }) => {
  const { Input, Select } = FormInfo.fields;
  const props = {
    name: 'value',
    label: formatMessage({ id: 'ConditionValue' }),
    rule: operator === 'regex' ? 'REQ MAIL_RULE_REGEX' : 'REQ'
  };
  switch (getValueKind(field)) {
    case 'hasAttachment':
      return (
        <Select
          {...props}
          options={[
            { label: formatMessage({ id: 'Yes' }), value: 'true' },
            { label: formatMessage({ id: 'No' }), value: 'false' }
          ]}
        />
      );
    case 'accountId':
      return <AccountSelectField {...props} />;
    case 'address':
      return <ContactInputField {...props} placeholder={formatMessage({ id: 'ConditionAddressPlaceholder' })} />;
    default:
      return <Input {...props} placeholder={formatMessage({ id: 'ConditionValuePlaceholder' })} />;
  }
};

export const CONDITION_EXTENSION_PREFIX = 'ext:';

export const getExtensionType = field => (typeof field === 'string' && field.startsWith(CONDITION_EXTENSION_PREFIX) ? field.slice(CONDITION_EXTENSION_PREFIX.length) : null);

export const useConditionExtensions = apis => {
  const { data } = useFetch(Object.assign({}, apis.mailGateway.rule.options));
  return Array.isArray(data?.extensions) ? data.extensions : [];
};

const isDirectionSupported = (meta, direction) => (meta.directions || ['receive', 'send']).includes(direction);

const ExtensionConditionBody = ({ meta, type, direction, SchemaRendererInner, formatMessage }) => {
  if (!meta) {
    return <Alert type="warning" showIcon message={formatMessage({ id: 'ConditionNotRegistered' }, { type })} />;
  }
  return (
    <>
      {meta.description && <Typography.Text type="secondary">{meta.description}</Typography.Text>}
      {!isDirectionSupported(meta, direction) && <Alert type="warning" showIcon message={formatMessage({ id: 'ConditionDirectionMismatch' })} />}
      {meta.formSchema && <SchemaRendererInner key={type} schema={meta.formSchema} showActions={false} className={style['action-form']} />}
    </>
  );
};

/**
 * 条件：匹配方式为 conditionMatch 字段，条件项为 conditionItems 分组，提交时由 toRulePayload 合成 { match, items }。
 * 字段下拉同时列出服务端注册的扩展条件（值为 ext:{type}），选中后参数表单按扩展条件的 formSchema 用 FormCreator 渲染
 */
const ConditionsField = createWithRemoteLoader({
  modules: [
    'components-core:FormInfo',
    'components-core:FormInfo@GroupList',
    'components-core:Global@usePreset',
    'components-thirdparty:FormCreator@SchemaRendererInner',
    'components-thirdparty:FormCreator@preset'
  ]
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo, GroupList, usePreset, SchemaRendererInner, formCreatorPreset] = remoteModules;
    const { RadioGroup, Select } = FormInfo.fields;
    const { apis } = usePreset();
    const { formatMessage, locale } = useIntl();
    registerMailActionFields(formCreatorPreset, locale);
    const { formData } = FormInfo.useFormContext();
    const groupRef = useRef(null);
    const direction = formData?.direction || 'receive';
    const extensions = useConditionExtensions(apis);
    const builtInFieldOptions = enums.mailConditionField({ locale }).map(item => ({ label: item.description, value: item.value }));
    const extensionOptions = extensions
      .filter(item => isDirectionSupported(item, direction))
      .map(item => ({ label: item.label || item.type, value: `${CONDITION_EXTENSION_PREFIX}${item.type}` }));
    const fieldOptions =
      extensionOptions.length > 0
        ? [
            { label: formatMessage({ id: 'BuiltInConditions' }), options: builtInFieldOptions },
            { label: formatMessage({ id: 'ExtensionConditions' }), options: extensionOptions }
          ]
        : builtInFieldOptions;
    const operatorOptions = enums.mailConditionOperator({ locale }).map(item => ({ label: item.description, value: item.value }));
    const equalsOptions = operatorOptions.filter(item => item.value === 'equals');

    return (
      <Flex vertical gap={12} className={style['rule-editor']}>
        <RadioGroup
          name="conditionMatch"
          label={formatMessage({ id: 'Conditions' })}
          defaultValue="all"
          options={[
            { label: formatMessage({ id: 'MatchAll' }), value: 'all' },
            { label: formatMessage({ id: 'MatchAny' }), value: 'any' }
          ]}
        />
        <div className={style['condition-list']}>
          <GroupList
            name="conditionItems"
            ref={groupRef}
            defaultLength={0}
            reverseOrder={false}
            empty={<Typography.Text type="secondary">{formatMessage({ id: 'EmptyConditionsTips' })}</Typography.Text>}
          >
            {({ id, index, onRemove }) => {
              const item = get(formData, ['conditionItems', index]) || {};
              const field = item.field || 'subject';
              const extensionType = getExtensionType(field);
              const equalsOnly = EQUALS_ONLY_FIELDS.includes(field);
              return (
                <div key={id} className={style['rule-row']}>
                  <span className={style['rule-row-index']}>{index + 1}</span>
                  <div className={style['rule-row-field']}>
                    <Select name="field" label={formatMessage({ id: 'ConditionField' })} rule="REQ" defaultValue="subject" options={fieldOptions} />
                  </div>
                  {extensionType ? (
                    <div className={style['rule-row-extension']}>
                      <ExtensionConditionBody
                        meta={extensions.find(meta => meta.type === extensionType)}
                        type={extensionType}
                        direction={direction}
                        SchemaRendererInner={SchemaRendererInner}
                        formatMessage={formatMessage}
                      />
                    </div>
                  ) : (
                    <>
                      <div className={style['rule-row-operator']}>
                        <Select
                          key={equalsOnly ? 'equals-only' : 'all'}
                          name="operator"
                          label={formatMessage({ id: 'ConditionOperator' })}
                          rule="REQ"
                          defaultValue={equalsOnly ? 'equals' : 'contains'}
                          options={equalsOnly ? equalsOptions : operatorOptions}
                        />
                      </div>
                      <div className={style['rule-row-value']}>
                        <ConditionValueField
                          key={getValueKind(field)}
                          FormInfo={FormInfo}
                          field={field}
                          operator={item.operator}
                          formatMessage={formatMessage}
                        />
                      </div>
                    </>
                  )}
                  <Button
                    type="text"
                    danger
                    className={style['rule-row-remove']}
                    icon={<DeleteOutlined />}
                    title={formatMessage({ id: 'Delete' })}
                    onClick={onRemove}
                  />
                </div>
              );
            }}
          </GroupList>
          <Button type="link" icon={<PlusOutlined />} className={style['action-add']} onClick={() => groupRef.current?.onAdd()}>
            {formatMessage({ id: 'AddCondition' })}
          </Button>
        </div>
      </Flex>
    );
  })
);

export const validateRegex = (value, { formatMessage }) => {
  try {
    new RegExp(value);
    return { result: true };
  } catch (e) {
    return { result: false, errMsg: formatMessage({ id: 'InvalidRegex' }, { value }) };
  }
};

export default ConditionsField;
