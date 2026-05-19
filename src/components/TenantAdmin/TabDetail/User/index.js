import { createWithRemoteLoader } from '@kne/remote-loader';
import { UserList } from '@components/Tenant';
import get from 'lodash/get';

const User = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, tenant }) => {
  const [usePreset] = remoteModules;
  const { apis, plugins } = usePreset();
  const getUserApis = get(plugins, 'tenantAdmin.getUserApis');
  const pluginApis = typeof getUserApis === 'function' ? getUserApis({ tenantId: tenant.id, tenant, apis }) : {};

  return (
    <UserList
      apis={Object.assign(
        {
          list: Object.assign({}, apis.tenantAdmin.userList, { params: { tenantId: tenant.id } }),
          orgList: Object.assign({}, apis.tenantAdmin.orgList, { params: { tenantId: tenant.id } }),
          roleList: Object.assign({}, apis.tenantAdmin.role.list, { params: { tenantId: tenant.id } }),
          create: Object.assign({}, apis.tenantAdmin.userCreate, { data: { tenantId: tenant.id } }),
          save: Object.assign({}, apis.tenantAdmin.userSave, { data: { tenantId: tenant.id } }),
          remove: Object.assign({}, apis.tenantAdmin.userRemove, { data: { tenantId: tenant.id } }),
          setStatus: Object.assign({}, apis.tenantAdmin.userSetStatus, { data: { tenantId: tenant.id } }),
          inviteToken: Object.assign({}, apis.tenantAdmin.userInviteToken, { params: { tenantId: tenant.id } }),
          userInviteMessage: Object.assign({}, apis.tenantAdmin.userInviteMessage, { data: { tenantId: tenant.id } })
        },
        pluginApis
      )}
    />
  );
});

export default User;
