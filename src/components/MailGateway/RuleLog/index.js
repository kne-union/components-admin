import { createWithRemoteLoader } from '@kne/remote-loader';
import { useFetch } from '@kne/react-fetch';
import { useMemo, useRef } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import enums from '../enums';
import Menu from '../Menu';
import { useAccountList } from '../fields';
import { useActionList } from '../Rule/ActionsField';
import { toFilterObject } from '../utils';
import { usePageRender } from '../PageLayout';
import ResultDetail from './ResultDetail';
import { createCardRenders, EnumTag, formatDateTime } from '../CardList';

const RuleLog = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:TablePage', 'components-core:Filter', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [LayoutTablePage, TablePage, Filter, usePreset] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields;
    const { apis } = usePreset();
    const { formatMessage, locale } = useIntl();
    const { list: accounts } = useAccountList(apis);
    const actionList = useActionList(apis);
    const { data: ruleData } = useFetch(Object.assign({}, apis.mailGateway.rule.list, { params: { perPage: 100 } }));
    const actionMap = useMemo(() => new Map(actionList.map(item => [item.type, item])), [actionList]);
    const accountMap = useMemo(() => new Map(accounts.map(item => [String(item.id), item])), [accounts]);
    const toOptions = list => list.map(item => ({ label: item.description, value: item.value }));
    const renderPage = usePageRender();
    const title = formatMessage({ id: 'RuleLog' });
    const ListPage = renderPage ? TablePage : LayoutTablePage;
    const listRef = useRef(null);
    const reloadList = () => listRef.current?.reload?.();

    const table = (
      <ListPage
        ref={listRef}
        {...(renderPage ? {} : { isNext: true, page: Object.assign({ title, menu: <Menu baseUrl={baseUrl} /> }, pageProps) })}
        name="mail-gateway-rule-log"
        {...Object.assign({}, apis.mailGateway.ruleLog.list, { params: { filter: {} } })}
        filter={{
          list: [
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'ruleId',
                label: formatMessage({ id: 'Rule' }),
                single: true,
                options: (ruleData?.pageData || []).map(item => ({ label: item.name, value: item.id }))
              }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'accountId',
                label: formatMessage({ id: 'Account' }),
                single: true,
                options: accounts.map(item => ({ label: item.name, value: item.id }))
              }
            },
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
              props: { name: 'status', label: formatMessage({ id: 'Status' }), single: true, options: toOptions(enums.mailRuleLogStatus({ locale })) }
            }
          ],
          mapFilterValue: value => ({ filter: toFilterObject(value) })
        }}
        pagination={{ paramsType: 'params' }}
        dataFormat={data => ({ list: data.pageData || [], total: data.totalCount, data })}
        columns={[
          { name: 'createdAt', title: formatMessage({ id: 'ExecutedAt' }), format: 'datetime' },
          { name: 'rule', title: formatMessage({ id: 'RuleName' }), renderType: 'main', getValueOf: item => item.rule?.name || item.ruleId },
          {
            name: 'mail',
            title: formatMessage({ id: 'Subject' }),
            renderType: 'description',
            width: 260,
            getValueOf: item => item.mail?.subject || formatMessage({ id: 'NoSubject' })
          },
          {
            name: 'accountId',
            title: formatMessage({ id: 'Account' }),
            width: 140,
            getValueOf: item => accountMap.get(String(item.accountId))?.name || item.accountId
          },
          { name: 'direction', title: formatMessage({ id: 'Direction' }), width: 100, renderType: 'enum', moduleName: 'mailRuleDirection' },
          { name: 'status', title: formatMessage({ id: 'Status' }), width: 100, renderType: 'enum', moduleName: 'mailRuleLogStatus' },
          {
            name: 'executionTime',
            title: formatMessage({ id: 'ExecutionTime' }),
            width: 120,
            getValueOf: item => (item.executionTime != null ? `${item.executionTime} ms` : '-')
          },
          {
            name: 'results',
            title: formatMessage({ id: 'ActionResults' }),
            width: 120,
            render: (value, { dataSource }) => (
              <ResultDetail type="link" size="small" data={dataSource} actionMap={actionMap} ruleName={dataSource.rule?.name || dataSource.ruleId} onSuccess={reloadList}>
                {formatMessage({ id: 'ViewDetail' })}
              </ResultDetail>
            )
          }
        ]}
        {...createCardRenders(item => {
          const ruleName = item.rule?.name || item.ruleId;
          return {
            title: ruleName,
            extra: <EnumTag moduleName="mailRuleLogStatus" value={item.status} locale={locale} />,
            subtitle: item.mail?.subject || formatMessage({ id: 'NoSubject' }),
            fields: [
              { label: formatMessage({ id: 'Account' }), value: accountMap.get(String(item.accountId))?.name || item.accountId },
              { label: formatMessage({ id: 'Direction' }), value: <EnumTag moduleName="mailRuleDirection" value={item.direction} locale={locale} /> },
              { label: formatMessage({ id: 'ExecutionTime' }), value: item.executionTime != null ? `${item.executionTime} ms` : '-' }
            ],
            footer: formatDateTime(item.createdAt),
            actions: (
              <ResultDetail type="link" size="small" data={item} actionMap={actionMap} ruleName={ruleName} onSuccess={reloadList}>
                {formatMessage({ id: 'ViewDetail' })}
              </ResultDetail>
            )
          };
        })}
      />
    );

    return renderPage ? renderPage({ title, children: table }) : table;
  })
);

export default RuleLog;
