import { createWithRemoteLoader } from '@kne/remote-loader';
import UserList from '../UserList';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import get from 'lodash/get';
import TablePageRender from '@components/BizUnit/TablePageRender';

const User = createWithRemoteLoader({
  modules: [
    'components-core:Layout@Page',
    'components-core:Global@usePreset',
    'components-core:Permissions',
    'components-core:Permissions@usePermissionsPass'
  ]
})(({ remoteModules, menu, children, pageProps: originPageProps, apis: extraApis = {} }) => {
  const [Page, usePreset, Permissions, usePermissionsPass] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, plugins } = usePreset();
  const getActions = get(plugins, 'tenant.getUserListActions');
  const allowCreate = usePermissionsPass({ request: ['setting:user-manager:create'] });
  const allowSave = usePermissionsPass({ request: ['setting:user-manager:edit'] });
  const allowRemove = usePermissionsPass({ request: ['setting:user-manager:remove'] });
  const allowInvite = usePermissionsPass({ request: ['setting:user-manager:invite'] });

  const pageProps = Object.assign({}, originPageProps, {
    menu,
    title: formatMessage({ id: 'UserManagement' }),
    children: (
      <Permissions request={['setting:user-manager:view']} type="error">
        <UserList
          topOptionsSize="small"
          allowQueryIdForUserFilter
          getActions={getActions}
          apis={Object.assign(
            {},
            {
              list: Object.assign({}, apis.tenant.userList),
              orgList: Object.assign({}, apis.tenant.orgList),
              create: allowCreate && Object.assign({}, apis.tenant.userCreate),
              save: allowSave && Object.assign({}, apis.tenant.userSave),
              remove: allowRemove && Object.assign({}, apis.tenant.userRemove),
              setStatus: allowSave && Object.assign({}, apis.tenant.userSetStatus),
              inviteToken: allowInvite && Object.assign({}, apis.tenant.userInviteToken),
              userInviteMessage: Object.assign({}, apis.tenant.userInviteMessage),
              sendOrgMessage: Object.assign({}, apis.tenant.sendOrgMessage),
              roleList: Object.assign({}, apis.tenant.role.list)
            },
            extraApis
          )}>
          {renderProps => <TablePageRender {...renderProps} withPage={false} />}
        </UserList>
      </Permissions>
    )
  });

  if (typeof children === 'function') {
    return children(pageProps);
  }

  return <Page {...pageProps} />;
});

export default withLocale(User);
