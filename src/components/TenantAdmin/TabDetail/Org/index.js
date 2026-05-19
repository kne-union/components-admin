import { createWithRemoteLoader } from '@kne/remote-loader';
import { OrgInfo } from '@components/Tenant';
import Fetch from '@kne/react-fetch';
import { useSearchParams } from 'react-router-dom';

const Org = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, tenant }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const [searchParams, setSearchParams] = useSearchParams();
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
            onViewUsers={org => {
              const next = new URLSearchParams(searchParams);
              next.set('tab', 'user');
              next.set('tenantOrgId', String(org.id));
              if (org.name) {
                next.set('orgName', org.name);
              } else {
                next.delete('orgName');
              }
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
});

export default Org;
