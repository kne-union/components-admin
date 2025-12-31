import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import Role from '../Role';
import TenantPermission from '../TenantPermission';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const Permission = createWithRemoteLoader({
  modules: ['components-core:StateBar']
})(({ remoteModules, apis, children }) => {
  const [StateBar] = remoteModules;
  const { formatMessage } = useIntl();
  const [activeKey, setActiveKey] = useState('tenant-permission');

  const stateBar = (
    <StateBar
      activeKey={activeKey}
      onChange={setActiveKey}
      type="radio"
      stateOption={[
        { tab: formatMessage({ id: 'TenantPermission' }), key: 'tenant-permission' },
        { tab: formatMessage({ id: 'Role' }), key: 'role' },
        { tab: formatMessage({ id: 'SharedGroup' }), key: 'sharedGroup' }
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
      {activeKey === 'sharedGroup' && formatMessage({ id: 'SharedGroup' })}
    </>
  );
});

export default withLocale(Permission);
