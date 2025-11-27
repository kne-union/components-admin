import { createWithRemoteLoader } from '@kne/remote-loader';
import { OrgInfo } from '@components/Tenant';
import Fetch from '@kne/react-fetch';

const Org = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, tenant }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
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
            companyName={tenant?.tenantCompany?.name}
            onSuccess={reload}
            apis={{
              create: Object.assign({}, apis.tenantAdmin.orgCreate, {
                data: { tenantId: tenant.id }
              }),
              save: Object.assign({}, apis.tenantAdmin.orgSave, {
                data: { tenantId: tenant.id }
              }),
              remove: Object.assign({}, apis.tenantAdmin.orgRemove, {
                data: { tenantId: tenant.id }
              })
            }}
          />
        );
      }}
    />
  );
});

export default Org;
