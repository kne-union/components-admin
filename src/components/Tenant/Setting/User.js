import { createWithRemoteLoader } from '@kne/remote-loader';
import UserList from '../UserList';
import { useState } from 'react';

const Org = createWithRemoteLoader({
  modules: [
    'components-core:Layout@Page',
    'components-core:Global@usePreset',
    'components-core:Permissions',
    'components-core:Permissions@usePermissionsPass',
    'components-core:Table@TablePage',
    'components-core:Filter@FilterProvider'
  ]
})(({ remoteModules, menu }) => {
  const [Page, usePreset, Permissions, usePermissionsPass, TablePage, FilterProvider] = remoteModules;
  const { apis } = usePreset();
  const [target, setTarget] = useState({});
  const filter = Object.assign({}, { value: [] }, target.filter);
  const allowCreate = usePermissionsPass({ request: ['setting:user-manager:create'] });
  const allowSave = usePermissionsPass({ request: ['setting:user-manager:edit'] });
  const allowRemove = usePermissionsPass({ request: ['setting:user-manager:remove'] });
  const allowInvite = usePermissionsPass({ request: ['setting:user-manager:invite'] });
  return (
    <Page title="用户管理" menu={menu} filter={filter} titleExtra={<FilterProvider {...filter}>{target.topOptions}</FilterProvider>}>
      <Permissions request={['setting:user-manager:view']} type="error">
        <UserList
          onMount={setTarget}
          apis={{
            list: Object.assign({}, apis.tenant.userList),
            orgList: Object.assign({}, apis.tenant.orgList),
            create: allowCreate && Object.assign({}, apis.tenant.userCreate),
            save: allowSave && Object.assign({}, apis.tenant.userSave),
            remove: allowRemove && Object.assign({}, apis.tenant.userRemove),
            setStatus: allowSave && Object.assign({}, apis.tenant.userSetStatus),
            inviteToken: allowInvite && Object.assign({}, apis.tenant.userInviteToken),
            userInviteMessage: Object.assign({}, apis.tenant.userInviteMessage),
            roleList: Object.assign({}, apis.tenant.role.list)
          }}>
          {({ tableOptions }) => <TablePage {...tableOptions} />}
        </UserList>
      </Permissions>
    </Page>
  );
});

export default Org;
