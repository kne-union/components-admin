import { createWithRemoteLoader } from '@kne/remote-loader';
import Role from '../Role';
import SharedGroup from '../SharedGroup';
import { useState } from 'react';
import transform from 'lodash/transform';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const PermissionInner = createWithRemoteLoader({
  modules: [
    'components-core:Layout@Page',
    'components-core:Global@usePreset',
    'components-core:Permissions',
    'components-core:Permissions@usePermissionsPass',
    'components-core:StateBar'
  ]
})(({ remoteModules, menu, pageProps: originPageProps, children }) => {
  const [Page, usePreset, Permissions, usePermissionsPass, StateBar] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis } = usePreset();
  const allowRole = usePermissionsPass({ request: ['setting:permission:role'] });
  const allowSharedGroup = usePermissionsPass({ request: ['setting:permission:shared-group'] });
  const allowRoleCreate = usePermissionsPass({ request: ['setting:permission:role:create'] });
  const allowRoleEdit = usePermissionsPass({ request: ['setting:permission:role:edit'] });
  const allowRoleRemove = usePermissionsPass({ request: ['setting:permission:role:remove'] });
  const allowSharedGroupCreate = usePermissionsPass({ request: ['setting:permission:shared-group:create'] });
  const allowSharedGroupEdit = usePermissionsPass({ request: ['setting:permission:shared-group:edit'] });
  const allowSharedGroupRemove = usePermissionsPass({ request: ['setting:permission:shared-group:remove'] });
  const [activeKey, setActiveKey] = useState(allowRole ? 'role' : 'sharedGroup');
  const rolePermissions = {
    create: allowRoleCreate,
    save: allowRoleEdit,
    setStatus: allowRoleEdit,
    permissionSave: allowRoleEdit,
    remove: allowRoleRemove
  };
  const sharedGroupPermissions = {
    list: true,
    create: allowSharedGroupCreate,
    save: allowSharedGroupEdit,
    setStatus: allowSharedGroupEdit,
    remove: allowSharedGroupRemove,
    permissionList: true,
    userList: true
  };
  const pageProps = Object.assign({}, originPageProps, {
    menu,
    title: formatMessage({ id: 'PermissionManagement' }),
    children: (
      <>
        <Permissions request={['setting:permission:role', 'setting:permission:shared-group']}>
          <div style={{ marginBottom: 8 }}>
            <StateBar
              activeKey={activeKey}
              onChange={setActiveKey}
              type={'radio'}
              stateOption={[
                { tab: formatMessage({ id: 'Role' }), key: 'role' },
                { tab: formatMessage({ id: 'SharedGroup' }), key: 'sharedGroup' }
              ].filter(item => {
                return (item.key === 'role' && allowRole) || (item.key === 'sharedGroup' && allowSharedGroup);
              })}
            />
          </div>
        </Permissions>
        {activeKey === 'role' && (
          <Permissions request={['setting:permission:role:view']} type="error">
            <Role
              apis={transform(
                apis.tenant.role,
                (result, value, key) => {
                  if (rolePermissions[key] !== false) {
                    result[key] = value;
                  }
                },
                {}
              )}
            />
          </Permissions>
        )}
        {activeKey === 'sharedGroup' && (
          <Permissions request={['setting:permission:shared-group:view']} type="error">
            <SharedGroup
              apis={transform(
                Object.assign({}, apis.tenant.sharedGroup, {
                  permissionList: apis.tenant.permission.list,
                  userList: apis.tenant.userList
                }),
                (result, value, key) => {
                  if (sharedGroupPermissions[key] !== false) {
                    result[key] = value;
                  }
                },
                {}
              )}
            />
          </Permissions>
        )}
      </>
    )
  });

  if (typeof children === 'function') {
    return children(pageProps);
  }

  return <Page {...pageProps} />;
});

export default withLocale(PermissionInner);
