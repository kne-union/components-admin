import { createWithRemoteLoader } from '@kne/remote-loader';
import { OrgInfo, isManagedTenant } from '@components/Tenant';
import ManagedTenantAlert from '@components/Tenant/ManagedTenantAlert';
import Fetch from '@kne/react-fetch';
import { useSearchParams } from 'react-router-dom';
import withLocale from '../../withLocale';
import { Flex } from 'antd';

const Org = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, tenant }) => {
    const [usePreset] = remoteModules;
    const { apis } = usePreset();
    const [searchParams, setSearchParams] = useSearchParams();
    const managed = isManagedTenant(tenant);
    return (
      <Fetch
        {...Object.assign({}, apis.tenantAdmin.orgLinkConfig, {
          params: { tenantId: tenant.id }
        })}
        render={({ data: linkConfigData, reload: reloadLinkConfig }) => {
          const linkedSource = linkConfigData?.enabled ? linkConfigData.source : null;
          const syncSupported = linkConfigData?.syncSupported;
          return (
            <Fetch
              {...Object.assign({}, apis.tenantAdmin.orgList, {
                params: {
                  tenantId: tenant.id
                }
              })}
              render={({ data, reload }) => {
                return (
                  <Flex vertical gap={16}>
                  {managed && <ManagedTenantAlert style={{ marginBottom: 0 }} />}
                  <OrgInfo
                    data={data}
                    tenantId={tenant.id}
                    companyName={tenant?.tenantCompany?.name}
                    onSuccess={reload}
                    linkedSource={linkedSource}
                    linkSettingProps={syncSupported && !managed ? {
                      tenantId: tenant.id,
                      envArgs: tenant.tenantSetting?.args || [],
                      onLinkChange: reloadLinkConfig
                    } : null}
                    thirdLoginSettingProps={{
                      envArgs: tenant.tenantSetting?.args || [],
                      onChange: reloadLinkConfig
                    }}
                    onViewUsers={org => {
                      const next = new URLSearchParams(searchParams);
                      next.set('tab', 'user');
                      next.set('tenantOrgId', String(org.id));
                      if (org.name != null && org.name !== '') {
                        next.set('tenantOrgName', String(org.name));
                      }
                      setSearchParams(next);
                    }}
                    apis={{
                      create: !managed && Object.assign({}, apis.tenantAdmin.orgCreate, {
                        data: { tenantId: tenant.id }
                      }),
                      save: !managed && Object.assign({}, apis.tenantAdmin.orgSave, {
                        data: { tenantId: tenant.id }
                      }),
                      remove: !managed && Object.assign({}, apis.tenantAdmin.orgRemove, {
                        data: { tenantId: tenant.id }
                      }),
                      userList: Object.assign({}, apis.tenantAdmin.userList, {
                        params: { tenantId: tenant.id }
                      }),
                      orgList: Object.assign({}, apis.tenantAdmin.orgList, {
                        params: { tenantId: tenant.id }
                      }),
                      import: !managed && apis.tenantAdmin.orgBatchImport,
                      orgLinkConfig: Object.assign({}, apis.tenantAdmin.orgLinkConfig, {
                        params: { tenantId: tenant.id }
                      }),
                      orgLinkSave: Object.assign({}, apis.tenantAdmin.orgLinkSave, {
                        data: { tenantId: tenant.id }
                      }),
                      orgLinkSync: Object.assign({}, apis.tenantAdmin.orgLinkSync, {
                        data: { tenantId: tenant.id }
                      }),
                      orgLinkCancel: Object.assign({}, apis.tenantAdmin.orgLinkCancel, {
                        data: { tenantId: tenant.id }
                      }),
                      thirdLoginConfig: Object.assign({}, apis.tenantAdmin.thirdLoginConfig, {
                        params: { tenantId: tenant.id }
                      }),
                      thirdLoginConfigSave: Object.assign({}, apis.tenantAdmin.thirdLoginConfigSave, {
                        data: { tenantId: tenant.id }
                      }),
                      thirdLoginConfigCancel: Object.assign({}, apis.tenantAdmin.thirdLoginConfigCancel, {
                        data: { tenantId: tenant.id }
                      })
                    }}
                  />
                  </Flex>
                );
              }}
            />
          );
        }}
      />
    );
  })
);

export default Org;
