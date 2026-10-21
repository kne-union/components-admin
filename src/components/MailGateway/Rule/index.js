import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo, useRef } from 'react';
import { useIntl } from '@kne/react-intl';
import BizUnit from '@components/BizUnit';
import withLocale from '../withLocale';
import enums from '../enums';
import { useBizUnitPage } from '../PageLayout';
import { getMoveSortActions } from '../MoveSortButton';
import { ContactsProvider, useAccountList, useGetContacts } from '../fields';
import { useActionList } from './ActionsField';
import { useConditionExtensions } from './ConditionsField';
import getColumns, { formatConditions } from './getColumns';
import { createCardRenders, EnumTag } from '../CardList';
import FormInner, { createRuleFormRules, toRuleFormData, toRulePayload } from './FormInner';
import TestRuleButton from './TestRuleButton';

const Rule = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Filter']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Filter] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields;
    const { apis } = usePreset();
    const { formatMessage, locale } = useIntl();
    const ruleApis = apis.mailGateway.rule;
    const listRef = useRef([]);
    const { list: accounts } = useAccountList(apis);
    const actionList = useActionList(apis);
    const accountMap = useMemo(() => new Map(accounts.map(item => [String(item.id), item])), [accounts]);
    const actionMap = useMemo(() => new Map(actionList.map(item => [item.type, item])), [actionList]);
    const conditionExtensions = useConditionExtensions(apis);
    const conditionMap = useMemo(() => new Map(conditionExtensions.map(item => [item.type, item])), [conditionExtensions]);
    const getContacts = useGetContacts();
    const toOptions = list => list.map(item => ({ label: item.description, value: item.value }));

    return (
      <BizUnit
        isNext
        name="mail-gateway-rule"
        {...useBizUnitPage({ title: formatMessage({ id: 'RuleManage' }), baseUrl, pageProps })}
        apis={{
          list: Object.assign({}, ruleApis.list, {
            params: { filter: {} },
            transformData: data => {
              listRef.current = data?.pageData || [];
              return data;
            }
          }),
          create: ({ formData }) => Object.assign({}, ruleApis.create, { data: toRulePayload(formData) }),
          save: ({ formData, data }) => Object.assign({}, ruleApis.save, { urlParams: { id: data.id }, data: toRulePayload(formData) }),
          remove: ({ data }) => Object.assign({}, ruleApis.remove, { urlParams: { id: data.id } }),
          setStatus: ({ data }) =>
            Object.assign({}, ruleApis.setStatus, {
              urlParams: { id: data.id },
              data: { status: data.status === 'enabled' ? 'disabled' : 'enabled' }
            })
        }}
        getColumns={() => getColumns({ formatMessage, locale, accountMap, actionMap, conditionMap })}
        getFormInner={() => (
          <ContactsProvider getContacts={getContacts}>
            <FormInner />
          </ContactsProvider>
        )}
        getActionList={props => [
          { ...props, actionMap, buttonComponent: TestRuleButton, children: formatMessage({ id: 'TestRule' }) },
          ...getMoveSortActions({ props, listRef, sortApi: ruleApis.sort, formatMessage })
        ]}
        filter={{
          list: [
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'direction',
                label: formatMessage({ id: 'Direction' }),
                single: true,
                options: toOptions(enums.mailRuleDirection({ locale }))
              }
            },
            {
              type: SuperSelectFilterItem,
              props: { name: 'status', label: formatMessage({ id: 'Status' }), single: true, options: toOptions(enums.mailRuleStatus({ locale })) }
            }
          ]
        }}
        options={{
          bizName: formatMessage({ id: 'Rule' }),
          keywordFilterLabel: formatMessage({ id: 'Keyword' }),
          openStatus: 'enabled',
          closedStatus: 'disabled',
          formSize: 'large',
          saveData: toRuleFormData,
          formProps: { rules: createRuleFormRules({ formatMessage }) },
          removeMessage: formatMessage({ id: 'ConfirmRemoveRule' }),
          openButtonProps: { children: formatMessage({ id: 'Enable' }) },
          closeButtonProps: { children: formatMessage({ id: 'Disable' }) },
          tableProps: createCardRenders(item => ({
            title: item.name,
            extra: (
              <>
                <EnumTag moduleName="mailRuleDirection" value={item.direction} locale={locale} />
                <EnumTag moduleName="mailRuleStatus" value={item.status} locale={locale} />
              </>
            ),
            muted: item.status !== 'enabled',
            fields: [
              {
                label: formatMessage({ id: 'ApplyAccounts' }),
                value: item.accountIds?.length
                  ? item.accountIds.map(id => accountMap.get(String(id))?.name || id).join('、')
                  : formatMessage({ id: 'AllAccounts' })
              },
              { label: formatMessage({ id: 'Conditions' }), value: formatConditions(item.conditions, { formatMessage, locale, conditionMap }) },
              {
                label: formatMessage({ id: 'Actions' }),
                value: (item.actions || []).map(action => actionMap.get(action.type)?.label || action.type).join(' → ') || '-'
              }
            ],
            footer: `${formatMessage({ id: 'Priority' })} ${item.priority ?? 0} · ${formatMessage({ id: 'StopProcessing' })} ${formatMessage({
              id: item.stopProcessing ? 'Yes' : 'No'
            })}`
          }))
        }}
      />
    );
  })
);

export default Rule;
