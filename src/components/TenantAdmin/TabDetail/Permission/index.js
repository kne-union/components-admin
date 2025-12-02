import { createWithRemoteLoader } from '@kne/remote-loader';
import { Permission as PermissionInner } from '@components/Tenant';
import merge from 'lodash/merge';

const Permission = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, tenant }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  return (
    <PermissionInner
      apis={{
        role: {
          create: merge({}, apis.tenantAdmin.role.create, {
            data: {
              tenantId: tenant.id
            }
          }),
          list: merge({}, apis.tenantAdmin.role.list, {
            params: {
              tenantId: tenant.id
            }
          }),
          save: merge({}, apis.tenantAdmin.role.save, {
            data: {
              tenantId: tenant.id
            }
          }),
          remove: merge({}, apis.tenantAdmin.role.remove, {
            data: {
              tenantId: tenant.id
            }
          }),
          setStatus: merge({}, apis.tenantAdmin.role.setStatus, {
            data: {
              tenantId: tenant.id
            }
          })
        },
        permission: {
          list: merge({}, apis.tenantAdmin.permission.list, {
            params: {
              tenantId: tenant.id
            }
          })
        }
      }}
    />
  );
});

export default Permission;
