import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import enums from '../enums';
import { AccountSelectField } from '../fields';
import ConditionsField, { CONDITION_EXTENSION_PREFIX, getExtensionType, validateRegex } from './ConditionsField';
import ActionsField from './ActionsField';
import style from '../style.module.scss';

const toConditionFormItem = item => (item.type ? Object.assign({}, item.params, { field: `${CONDITION_EXTENSION_PREFIX}${item.type}` }) : item);

// 扩展条件的参数与 field / operator / value 同处一个分组项，参数名避开这三个
const toConditionItem = ({ field, operator, value, ...params }) => {
  const type = getExtensionType(field);
  return type ? { type, params } : { field, operator, value };
};

export const toRuleFormData = ({ conditions, actions, trigger, ...data }) =>
  Object.assign({}, data, {
    accountIds: data.accountIds || [],
    conditionMatch: conditions?.match || 'all',
    conditionItems: (conditions?.items || []).map(toConditionFormItem),
    actions: (actions || []).map(item => Object.assign({}, item.params, { type: item.type })),
    triggerWindowDays: trigger?.windowDays,
    triggerMinCount: trigger?.minCount,
    triggerCooldownMinutes: trigger?.cooldownMinutes
  });

export const toRulePayload = ({ conditionMatch, conditionItems, actions, triggerWindowDays, triggerMinCount, triggerCooldownMinutes, ...formData }) =>
  Object.assign({}, formData, {
    accountIds: formData.accountIds || [],
    conditions: { match: conditionMatch || 'all', items: (conditionItems || []).map(toConditionItem) },
    actions: (actions || []).map(({ type, ...params }) => ({ type, params })),
    trigger:
      formData.direction === 'schedule'
        ? { windowDays: triggerWindowDays, minCount: triggerMinCount, cooldownMinutes: triggerCooldownMinutes ?? undefined }
        : null,
    stopProcessing: !!formData.stopProcessing
  });

// 定时规则的触发配置：时间窗口内未读邮件达到数量时触发
const ScheduleTriggerInfo = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { InputNumber } = FormInfo.fields;
    const { formData } = FormInfo.useFormContext();
    const { formatMessage } = useIntl();
    if (formData?.direction !== 'schedule') {
      return null;
    }
    return (
      <FormInfo
        title={formatMessage({ id: 'ScheduleTrigger' })}
        column={3}
        list={[
          <InputNumber
            name="triggerWindowDays"
            label={formatMessage({ id: 'TriggerWindowDays' })}
            tips={formatMessage({ id: 'TriggerWindowDaysTips' })}
            rule="REQ"
            min={1}
            defaultValue={1}
          />,
          <InputNumber
            name="triggerMinCount"
            label={formatMessage({ id: 'TriggerMinCount' })}
            tips={formatMessage({ id: 'TriggerMinCountTips' })}
            rule="REQ"
            min={1}
            defaultValue={10}
          />,
          <InputNumber
            name="triggerCooldownMinutes"
            label={formatMessage({ id: 'TriggerCooldownMinutes' })}
            tips={formatMessage({ id: 'TriggerCooldownMinutesTips' })}
            min={0}
          />
        ]}
      />
    );
  })
);

// 未读邮件规则的条件含义不同，在分组标题后补一句说明
const ConditionsTitle = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { formData } = FormInfo.useFormContext();
    const { formatMessage } = useIntl();
    return (
      <>
        {formatMessage({ id: 'Conditions' })}
        {formData?.direction === 'schedule' && <span className={style['part-title-tips']}>{formatMessage({ id: 'ScheduleConditionsTips' })}</span>}
      </>
    );
  })
);

export const createRuleFormRules = ({ formatMessage }) => ({
  MAIL_RULE_REGEX: value => validateRegex(value, { formatMessage })
});

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { Input, Select, Slider, Switch, TextArea } = FormInfo.fields;
    const { formatMessage, locale } = useIntl();
    return (
      <>
        <FormInfo
          title={formatMessage({ id: 'BasicInfo' })}
          column={2}
          list={[
            <Input name="name" label={formatMessage({ id: 'RuleName' })} rule="REQ LEN-1-100" />,
            <Select
              name="direction"
              label={formatMessage({ id: 'Direction' })}
              rule="REQ"
              defaultValue="receive"
              tips={formatMessage({ id: 'DirectionTips' })}
              options={enums.mailRuleDirection({ locale }).map(item => ({ label: item.description, value: item.value }))}
            />,
            <AccountSelectField
              name="accountIds"
              label={formatMessage({ id: 'ApplyAccounts' })}
              mode="multiple"
              tips={formatMessage({ id: 'ApplyAccountsTips' })}
            />,
            <Slider
              name="priority"
              label={formatMessage({ id: 'Priority' })}
              min={0}
              max={100}
              marks={{ 0: '0', 50: '50', 100: '100' }}
              tips={formatMessage({ id: 'PriorityTips' })}
            />,
            <Switch
              name="stopProcessing"
              label={formatMessage({ id: 'StopProcessing' })}
              tips={formatMessage({ id: 'StopProcessingTips' })}
              defaultValue={true}
            />,
            <TextArea name="description" label={formatMessage({ id: 'Description' })} block />
          ]}
        />
        <ScheduleTriggerInfo />
        <FormInfo title={<ConditionsTitle />} className={style['label-hidden-part']} column={1} list={[<ConditionsField />]} />
        <FormInfo title={formatMessage({ id: 'Actions' })} column={1} list={[<ActionsField />]} />
      </>
    );
  })
);

export default FormInner;
