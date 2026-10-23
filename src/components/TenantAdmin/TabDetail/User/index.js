import { createWithRemoteLoader } from '@kne/remote-loader';
import { UserList, isManagedTenant } from '@components/Tenant';
import ManagedTenantAlert from '@components/Tenant/ManagedTenantAlert';
import TablePageRender from '@components/BizUnit/TablePageRender';
import get from 'lodash/get';

/** 嵌在 StateBarPage 内时不要再套 Layout@TablePage，避免覆盖外层 PageHeader */
const renderUserList = ({ tableOptions }) => <TablePageRender tableOptions={tableOptions} withPage={false} />;

const User = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, tenant }) => {
  const [usePreset] = remoteModules;
  const { apis, plugins } = usePreset();
  const getUserApis = get(plugins, 'tenantAdmin.getUserApis');
  const pluginApis = typeof getUserApis === 'function' ? getUserApis({ tenantId: tenant.id, tenant, apis }) : {};
  const managed = isManagedTenant(tenant);
  const writeApis = managed
    ? { create: null, save: null, remove: null, setStatus: null, inviteToken: null }
    : {
        create: Object.assign({}, apis.tenantAdmin.userCreate, { data: { tenantId: tenant.id } }),
        save: Object.assign({}, apis.tenantAdmin.userSave, { data: { tenantId: tenant.id } }),
        remove: Object.assign({}, apis.tenantAdmin.userRemove, { data: { tenantId: tenant.id } }),
        setStatus: Object.assign({}, apis.tenantAdmin.userSetStatus, { data: { tenantId: tenant.id } }),
        inviteToken: Object.assign({}, apis.tenantAdmin.userInviteToken, { params: { tenantId: tenant.id } })
      };

  return (
    <>
      {managed && <ManagedTenantAlert />}
      <UserList
        topOptionsSize="small"
        apis={Object.assign(
          {
            list: Object.assign({}, apis.tenantAdmin.userList, { params: { tenantId: tenant.id } }),
            orgList: Object.assign({}, apis.tenantAdmin.orgList, { params: { tenantId: tenant.id } }),
            roleList: Object.assign({}, apis.tenantAdmin.role.list, { params: { tenantId: tenant.id } }),
            ...writeApis,
            userInviteMessage: Object.assign({}, apis.tenantAdmin.userInviteMessage, { data: { tenantId: tenant.id } }),
            sendOrgMessage: Object.assign({}, apis.tenantAdmin.sendOrgMessage, { data: { tenantId: tenant.id } }),
            thirdLoginConfig: Object.assign({}, apis.tenantAdmin.thirdLoginConfig, { params: { tenantId: tenant.id } }),
            thirdLoginBindToken: Object.assign({}, apis.tenantAdmin.thirdLoginBindToken, { data: { tenantId: tenant.id } }),
            thirdLoginUnbind: Object.assign({}, apis.tenantAdmin.thirdLoginUnbind, { data: { tenantId: tenant.id } })
          },
          pluginApis
        )}
      >
        {renderUserList}
      </UserList>
    </>
  );
});

export default User;
