import { createWithRemoteLoader } from '@kne/remote-loader';
import { useEffect, useRef, useState } from 'react';
import { Flex } from 'antd';
import merge from 'lodash/merge';
import { useIsMobile } from '@kne/responsive-utils';
import Role from '../Role';
import SharedGroup from '../SharedGroup';
import TenantPermission from '../TenantPermission';
import TablePageRender from '@components/BizUnit/TablePageRender';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

/** 把 BizUnit titleExtra 提到 StateBar 右侧；勿把 titleExtra 放进 effect 依赖，避免死循环 */
const SyncTitleExtra = ({ titleExtra, onTitleExtra, children }) => {
  const titleExtraRef = useRef(titleExtra);
  titleExtraRef.current = titleExtra;

  useEffect(() => {
    onTitleExtra(titleExtraRef.current || null);
    return () => onTitleExtra(null);
  }, [onTitleExtra]);

  return children;
};

const Permission = createWithRemoteLoader({
  modules: ['components-core:StateBar']
})(({ remoteModules, apis, children }) => {
  const [StateBar] = remoteModules;
  const { formatMessage } = useIntl();
  const isMobile = useIsMobile();
  const [activeKey, setActiveKey] = useState('tenant-permission');
  const [titleExtra, setTitleExtra] = useState(null);
  const useCustomRender = typeof children === 'function';

  const stateBar = (
    <StateBar
      activeKey={activeKey}
      onChange={key => {
        setTitleExtra(null);
        setActiveKey(key);
      }}
      type="radio"
      tabBarExtraContent={isMobile ? null : titleExtra}
      stateOption={[
        { tab: formatMessage({ id: 'TenantPermission' }), key: 'tenant-permission' },
        { tab: formatMessage({ id: 'Role' }), key: 'role' },
        { tab: formatMessage({ id: 'SharedGroup' }), key: 'sharedGroup' }
      ]}
    />
  );

  const renderBizList = renderProps => (
    <SyncTitleExtra titleExtra={renderProps.titleExtra} onTitleExtra={setTitleExtra}>
      <TablePageRender {...renderProps} />
    </SyncTitleExtra>
  );

  const wrapChildren = props =>
    children(
      Object.assign({}, props, {
        stateBar
      })
    );

  return (
    <Flex vertical gap={8}>
      {useCustomRender ? null : (
        <>
          {stateBar}
          {isMobile && titleExtra ? <Flex justify="flex-end">{titleExtra}</Flex> : null}
        </>
      )}
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
