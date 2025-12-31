import { createWithRemoteLoader } from '@kne/remote-loader';
import Role from '../Role';
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
    'components-core:Filter@FilterProvider',
    'components-core:Table@TablePage',
    'components-core:StateBar'
  ]
})(({ remoteModules, menu, children }) => {
  const [Page, usePreset, Permissions, usePermissionsPass, FilterProvider, TablePage, StateBar] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis } = usePreset();
  const [target, setTarget] = useState({});
  const filter = Object.assign({}, { value: [] }, target.filter);
  const allowRole = usePermissionsPass({ request: ['setting:permission:role'] });
  const allowSharedGroup = usePermissionsPass({ request: ['setting:permission:shared-group'] });
  const allowRoleCreate = usePermissionsPass({ request: ['setting:permission:role:create'] });
  const allowRoleEdit = usePermissionsPass({ request: ['setting:permission:role:edit'] });
  const allowRoleRemove = usePermissionsPass({ request: ['setting:permission:role:remove'] });
  /*const allowSharedGroupCreate = usePermissionsPass({ request: ['setting:permission:shared-group:create'] });
  const allowSharedGroupEdit = usePermissionsPass({ request: ['setting:permission:shared-group:edit'] });
  const allowSharedGroupRemove = usePermissionsPass({ request: ['setting:permission:shared-group:remove'] });*/
  const [activeKey, setActiveKey] = useState(allowRole ? 'role' : 'sharedGroup');
  const rolePermissions = {
    create: allowRoleCreate,
    save: allowRoleEdit,
    setStatus: allowRoleEdit,
    permissionSave: allowRoleEdit,
    remove: allowRoleRemove
  };
  const pageProps = {
    menu,
    title: formatMessage({ id: 'PermissionManagement' }),
    filter,
    titleExtra: <FilterProvider {...filter}>{target.topOptions}</FilterProvider>,
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
              onMount={setTarget}>
              {({ tableOptions }) => <TablePage {...tableOptions} />}
            </Role>
          </Permissions>
        )}
      </>
    )
  };

  if (typeof children === 'function') {
    return children(pageProps);
  }

  return <Page {...pageProps} />;
});

export default withLocale(PermissionInner);
