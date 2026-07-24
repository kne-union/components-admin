import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Flex } from 'antd';
import merge from 'lodash/merge';
import Role from '../Role';
import SharedGroup from '../SharedGroup';
import TenantPermission from '../TenantPermission';
import TablePageRender from '@components/BizUnit/TablePageRender';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const Permission = createWithRemoteLoader({
  modules: ['components-core:StateBar']
})(({ remoteModules, apis, children }) => {
  const [StateBar] = remoteModules;
  const { formatMessage } = useIntl();
  const [activeKey, setActiveKey] = useState('tenant-permission');
  const useCustomRender = typeof children === 'function';

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

  const renderBizList = renderProps => <TablePageRender {...renderProps} withPage={false} />;

  const wrapChildren = props =>
    children(
      Object.assign({}, props, {
        stateBar
      })
    );

  return (
    <Flex vertical gap={8}>
      {useCustomRender ? null : stateBar}
      {activeKey === 'tenant-permission' && (
        <TenantPermission apis={apis.permission}>
          {useCustomRender ? wrapChildren : null}
        </TenantPermission>
      )}
      {activeKey === 'role' && (
        <Role apis={apis.role}>{useCustomRender ? wrapChildren : renderBizList}</Role>
      )}
      {activeKey === 'sharedGroup' && (
        <SharedGroup
          apis={merge({}, apis.sharedGroup, {
            permissionList: apis.permission?.list,
            userList: apis.userList
          })}>
          {useCustomRender ? wrapChildren : renderBizList}
        </SharedGroup>
      )}
    </Flex>
  );
});

export default withLocale(Permission);
