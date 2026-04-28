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
import get from 'lodash/get';

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
  const { apis, plugins } = usePreset();
  const { formatMessage } = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const appendTabDetails = get(plugins, 'admin.tenant.appendTabDetails');
  return (
    <Fetch
      {...Object.assign({}, apis.tenantAdmin.detail, { params: { id: searchParams.get('id') } })}
      render={({ data, reload }) => {
        const stateOption = [
          { tab: formatMessage({ id: 'CompanyInfo' }), key: 'company' },
          { tab: formatMessage({ id: 'OrgStructure' }), key: 'org' },
          { tab: formatMessage({ id: 'Permission' }), key: 'permission' },
          { tab: formatMessage({ id: 'UserList' }), key: 'user' },
          {
            tab: formatMessage({ id: 'Setting' }),
            key: 'setting'
          }
        ];
        const componentMap = Object.assign({}, contentMap);
        if (appendTabDetails && Array.isArray(appendTabDetails) && appendTabDetails.length > 0) {
          appendTabDetails.forEach(item => {
            stateOption.splice(Number.isInteger(item.index) && item.index >= 1 ? item.index : stateOption.length - 1, 0, {
              tab: item.tab,
              key: item.key
            });
            componentMap[item.key] = item.component;
          });
        }
        const activeKey = searchParams.get('tab') || 'company';
        const ContentComponent = componentMap[activeKey] || Company;
        return (
          <StateBarPage
            {...props}
            headerFixed={false}
            header={
              <PageHeader
                title={data.name}
                info={`ID: ${data.id}`}
                tags={[
                  data.status === 'open' ? (
                    <StateTag type="success" text={formatMessage({ id: 'Open' })} />
                  ) : (
                    <StateTag type="danger" text={formatMessage({ id: 'Close' })} />
                  ),
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
              stateOption
            }}>
            <ContentComponent tenant={data} reload={reload} />
          </StateBarPage>
        );
      }}
    />
  );
});

export default withLocale(TabDetailInner);
