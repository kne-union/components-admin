import { createWithRemoteLoader } from '@kne/remote-loader';
import UserList from '../UserList';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import { useState } from 'react';

const User = createWithRemoteLoader({
  modules: [
    'components-core:Layout@Page',
    'components-core:Global@usePreset',
    'components-core:Permissions',
    'components-core:Permissions@usePermissionsPass',
    'components-core:Table@TablePage',
    'components-core:Filter@FilterProvider'
  ]
})(({ remoteModules, menu, children }) => {
  const [Page, usePreset, Permissions, usePermissionsPass, TablePage, FilterProvider] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis } = usePreset();
  const [target, setTarget] = useState({});
  const filter = Object.assign({}, { value: [] }, target.filter);
  const allowCreate = usePermissionsPass({ request: ['setting:user-manager:create'] });
  const allowSave = usePermissionsPass({ request: ['setting:user-manager:edit'] });
  const allowRemove = usePermissionsPass({ request: ['setting:user-manager:remove'] });
  const allowInvite = usePermissionsPass({ request: ['setting:user-manager:invite'] });

  const pageProps = {
    menu,
    title: formatMessage({ id: 'UserManagement' }),
    filter,
    titleExtra: <FilterProvider {...filter}>{target.topOptions}</FilterProvider>,
    children: (
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
    )
  };

  if (typeof children === 'function') {
    return children(pageProps);
  }

  return <Page {...pageProps} />;
});

export default withLocale(User);
