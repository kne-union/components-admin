import { createWithRemoteLoader } from '@kne/remote-loader';
import { OrgInfo } from '@components/Tenant';
import Fetch from '@kne/react-fetch';
import { useSearchParams } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import { Flex } from 'antd';

const Org = createWithRemoteLoader({
  modules: ['components-core:Filter@filterToUrlParams', 'components-core:Global@usePreset']
})(withLocale(({ remoteModules, tenant }) => {
  const [filterToUrlParams, usePreset] = remoteModules;
  const { apis } = usePreset();
  const { formatMessage } = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Fetch
      {...Object.assign({}, apis.tenantAdmin.orgLinkConfig, {
        params: { tenantId: tenant.id }
      })}
      render={({ data: linkConfigData, reload: reloadLinkConfig }) => {
        const linkedSource = linkConfigData?.enabled ? linkConfigData.source : null;
        return (
          <Fetch
            {...Object.assign({}, apis.tenantAdmin.orgList, {
              params: {
                tenantId: tenant.id
              }
            })}
            render={({ data, reload }) => {
              return (
                <OrgInfo
                  data={data}
                  tenantId={tenant.id}
                  companyName={tenant?.tenantCompany?.name}
                  onSuccess={reload}
                  linkedSource={linkedSource}
                  linkSettingProps={{
                    tenantId: tenant.id,
                    envArgs: tenant.tenantSetting?.args || [],
                    onLinkChange: reloadLinkConfig
                  }}
                  onViewUsers={org => {
                    const next = new URLSearchParams(searchParams);
                    next.set('tab', 'user');
                    const filterParams = filterToUrlParams([
                      { name: 'tenantOrgId', label: formatMessage({ id: 'Department' }), value: { label: org.name || String(org.id), value: String(org.id) } }
                    ]);
                    filterParams.forEach((value, key) => {
                      next.set(key, value);
                    });
                    setSearchParams(next);
                  }}
                  apis={{
                    create: Object.assign({}, apis.tenantAdmin.orgCreate, {
                      data: { tenantId: tenant.id }
                    }),
                    save: Object.assign({}, apis.tenantAdmin.orgSave, {
                      data: { tenantId: tenant.id }
                    }),
                    remove: Object.assign({}, apis.tenantAdmin.orgRemove, {
                      data: { tenantId: tenant.id }
                    }),
                    userList: Object.assign({}, apis.tenantAdmin.userList, {
                      params: { tenantId: tenant.id }
                    }),
                    import: apis.tenantAdmin.orgBatchImport
                  }}
                />
              );
            }}
          />
        );
      }}
    />
  );
}));

export default Org;
