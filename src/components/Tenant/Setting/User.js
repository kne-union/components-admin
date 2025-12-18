import { createWithRemoteLoader } from '@kne/remote-loader';
import UserList from '../UserList';

const Org = createWithRemoteLoader({
  modules: ['components-core:Layout@Page', 'components-core:Global@usePreset']
})(({ remoteModules, menu }) => {
  const [Page, usePreset] = remoteModules;
  const { apis } = usePreset();
  return (
    <Page title="用户管理" menu={menu}>
      <UserList
        apis={{
          list: Object.assign({}, apis.tenant.userList),
          orgList: Object.assign({}, apis.tenant.orgList),
          create: Object.assign({}, apis.tenant.userCreate),
          save: Object.assign({}, apis.tenant.userSave),
          remove: Object.assign({}, apis.tenant.userRemove),
          setStatus: Object.assign({}, apis.tenant.userSetStatus),
          inviteToken: Object.assign({}, apis.tenant.userInviteToken),
          userInviteMessage: Object.assign({}, apis.tenant.userInviteMessage),
          roleList: Object.assign({}, apis.tenant.role.list)
        }}
      />
    </Page>
  );
});

export default Org;
