import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useSearchParams } from 'react-router-dom';
import Actions from '../Actions';
import dayjs from 'dayjs';
import Company from './Company';
import Org from './Org';
import User from './User';
import Permission from './Permission';
import Setting from './Setting';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const contentMap = {
  company: Company,
  org: Org,
  user: User,
  permission: Permission,
  setting: Setting
};

const TabDetailInner = createWithRemoteLoader({
  modules: [
    'components-core:Layout@StateBarPage',
    'components-core:Global@usePreset',
    'components-core:Layout@PageHeader',
    'components-core:StateTag',
    'components-core:InfoPage',
    'components-core:Descriptions'
  ]
})(({ remoteModules, ...props }) => {
  const [StateBarPage, usePreset, PageHeader, StateTag] = remoteModules;
  const { apis } = usePreset();
  const { formatMessage } = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Fetch
      {...Object.assign({}, apis.tenantAdmin.detail, { params: { id: searchParams.get('id') } })}
      render={({ data, reload }) => {
        const activeKey = searchParams.get('tab') || 'company';
        const ContentComponent = contentMap[activeKey] || Company;
        return (
          <StateBarPage
            {...props}
            headerFixed={false}
            header={
              <PageHeader
                title={data.name}
                info={`ID: ${data.id}`}
                tags={[
                  data.status === 'open' ? <StateTag type="success" text={formatMessage({ id: 'Open' })} /> : <StateTag type="danger" text={formatMessage({ id: 'Close' })} />,
                  `${formatMessage({ id: 'ServiceTimeRange' })}:${dayjs(data.serviceStartTime).format('YYYY-MM-DD')}~${dayjs(data.serviceEndTime).format('YYYY-MM-DD')}`,
                  `${formatMessage({ id: 'AccountCountTag' })}:${data.accountCount}`
                ]}
                buttonOptions={
                  <Actions
                    data={data}
                    onSuccess={() => {
                      reload();
                    }}
                  />
                }
              />
            }
            stateBar={{
              activeKey,
              onChange: key => {
                searchParams.set('tab', key);
                setSearchParams(searchParams.toString());
              },
              stateOption: [
                { tab: formatMessage({ id: 'CompanyInfo' }), key: 'company' },
                { tab: formatMessage({ id: 'OrgStructure' }), key: 'org' },
                { tab: formatMessage({ id: 'Permission' }), key: 'permission' },
                { tab: formatMessage({ id: 'UserList' }), key: 'user' },
                {
                  tab: formatMessage({ id: 'Setting' }),
                  key: 'setting'
                }
              ]
            }}>
            <ContentComponent tenant={data} reload={reload} />
          </StateBarPage>
        );
      }}
    />
  );
});

export default withLocale(TabDetailInner);
