import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import Role from '../Role';
import TenantPermission from '../TenantPermission';

const Permission = createWithRemoteLoader({
  modules: ['components-core:StateBar']
})(({ remoteModules, apis, children }) => {
  const [StateBar] = remoteModules;
  const [activeKey, setActiveKey] = useState('tenant-permission');

  const stateBar = (
    <StateBar
      activeKey={activeKey}
      onChange={setActiveKey}
      type="radio"
      stateOption={[
        { tab: '租户权限', key: 'tenant-permission' },
        { tab: '角色', key: 'role' },
        { tab: '共享组', key: 'sharedGroup' }
      ]}
    />
  );

  return (
    <>
      {typeof children === 'function' ? null : stateBar}
      {activeKey === 'tenant-permission' && (
        <TenantPermission apis={apis.permission}>
          {typeof children === 'function'
            ? props =>
                children(
                  Object.assign({}, props, {
                    stateBar
                  })
                )
            : null}
        </TenantPermission>
      )}
      {activeKey === 'role' && (
        <Role apis={apis.role}>
          {typeof children === 'function'
            ? props =>
                children(
                  Object.assign({}, props, {
                    stateBar
                  })
                )
            : null}
        </Role>
      )}
      {activeKey === 'sharedGroup' && '共享组'}
    </>
  );
});

export default Permission;
