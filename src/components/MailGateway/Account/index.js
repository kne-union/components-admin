import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import { useSearchParams } from 'react-router-dom';
import BizUnit from '@components/BizUnit';
import { useAccountList } from '../fields';
import withLocale from '../withLocale';
import enums from '../enums';
import { useBizUnitPage } from '../PageLayout';
import getColumns from './getColumns';
import FormInner, { toAccountFormData, toAccountPayload } from './FormInner';
import { SyncButton, SyncHistoryButton, TestConnectionButton } from './Actions';
import { createCardRenders, EnumTag, formatDateTime } from '../CardList';
import style from '../style.module.scss';

const Account = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Filter']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Filter] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields;
    const { apis } = usePreset();
    const { formatMessage, locale } = useIntl();
    const [searchParams, setSearchParams] = useSearchParams();
    const { list: accounts } = useAccountList(apis);
    const accountApis = apis.mailGateway.account;

    return (
      <BizUnit
        isNext
        name="mail-gateway-account"
        {...useBizUnitPage({ title: formatMessage({ id: 'AccountManage' }), baseUrl, pageProps })}
        apis={{
          list: Object.assign({}, accountApis.list, { params: { filter: {} } }),
          create: ({ formData }) => Object.assign({}, accountApis.create, { data: toAccountPayload(formData) }),
          save: ({ formData, data }) => Object.assign({}, accountApis.save, { urlParams: { id: data.id }, data: toAccountPayload(formData) }),
          remove: ({ data }) => Object.assign({}, accountApis.remove, { urlParams: { id: data.id } }),
          setStatus: ({ data }) =>
            Object.assign({}, accountApis.setStatus, {
              urlParams: { id: data.id },
              data: { status: data.status === 'enabled' ? 'disabled' : 'enabled' }
            })
        }}
        getColumns={() => getColumns({ formatMessage })}
        getFormInner={({ action, data }) => <FormInner action={action} data={data} />}
        getActionList={props => [
          {
            ...props,
            buttonComponent: TestConnectionButton,
            children: formatMessage({ id: 'TestConnection' })
          },
          {
            ...props,
            buttonComponent: SyncButton,
            children: formatMessage({ id: 'SyncNow' }),
            hidden: props.data?.status !== 'enabled'
          },
          {
            ...props,
            buttonComponent: SyncHistoryButton,
            children: formatMessage({ id: 'SyncHistory' }),
            hidden: props.data?.status !== 'enabled'
          }
        ]}
        searchParamsValue={{
          searchParams,
          setSearchParams,
          fields: [{ name: 'id', label: formatMessage({ id: 'Account' }), labelKey: 'accountName' }]
        }}
        filter={{
          list: [
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'id',
                label: formatMessage({ id: 'Account' }),
                single: true,
                options: accounts.map(item => ({ label: item.name, value: item.id }))
              }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'status',
                label: formatMessage({ id: 'Status' }),
                single: true,
                options: enums.mailAccountStatus({ locale }).map(item => ({ label: item.description, value: item.value }))
              }
            }
          ]
        }}
        options={{
          bizName: formatMessage({ id: 'Account' }),
          keywordFilterLabel: formatMessage({ id: 'Keyword' }),
          openStatus: 'enabled',
          closedStatus: 'disabled',
          formSize: 'large',
          saveData: toAccountFormData,
          removeMessage: formatMessage({ id: 'ConfirmRemoveAccount' }),
          openButtonProps: { children: formatMessage({ id: 'Enable' }) },
          closeButtonProps: { children: formatMessage({ id: 'Disable' }) },
          tableProps: createCardRenders(item => ({
            title: item.name,
            extra: <EnumTag moduleName="mailAccountStatus" value={item.status} locale={locale} />,
            subtitle: item.address,
            muted: item.status !== 'enabled',
            description: item.lastError && <span className={style['card-error']}>{item.lastError}</span>,
            fields: [
              { label: 'IMAP', value: item.imap ? `${item.imap.host}:${item.imap.port}` : '-' },
              { label: 'SMTP', value: item.smtp ? `${item.smtp.host}:${item.smtp.port}` : '-' }
            ],
            footer: `${formatMessage({ id: 'LastSyncAt' })} ${formatDateTime(item.lastSyncAt)}`
          }))
        }}
      />
    );
  })
);

export default Account;
