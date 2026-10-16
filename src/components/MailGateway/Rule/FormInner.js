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

export const toRuleFormData = ({ conditions, actions, ...data }) =>
  Object.assign({}, data, {
    accountIds: data.accountIds || [],
    conditionMatch: conditions?.match || 'all',
    conditionItems: (conditions?.items || []).map(toConditionFormItem),
    actions: (actions || []).map(item => Object.assign({}, item.params, { type: item.type }))
  });

export const toRulePayload = ({ conditionMatch, conditionItems, actions, ...formData }) =>
  Object.assign({}, formData, {
    accountIds: formData.accountIds || [],
    conditions: { match: conditionMatch || 'all', items: (conditionItems || []).map(toConditionItem) },
    actions: (actions || []).map(({ type, ...params }) => ({ type, params })),
    stopProcessing: !!formData.stopProcessing
  });

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
        <FormInfo title={formatMessage({ id: 'Conditions' })} className={style['label-hidden-part']} column={1} list={[<ConditionsField />]} />
        <FormInfo title={formatMessage({ id: 'Actions' })} column={1} list={[<ActionsField />]} />
      </>
    );
  })
);

export default FormInner;
