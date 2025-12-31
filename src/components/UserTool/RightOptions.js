import { createWithRemoteLoader } from '@kne/remote-loader';
import UserTool from './UserTool';
import Language from '@components/Account/Language';
import { Flex } from 'antd';

const RightOptions = createWithRemoteLoader({
  modules: ['components-core:Global@GlobalValue']
})(({ remoteModules }) => {
  const [GlobalValue] = remoteModules;

  return (
    <Flex gap={8}>
      <Language />
      <GlobalValue globalKey="userInfo">
        {({ value }) => {
          if (!value) {
            return null;
          }
          const { userInfo, tenantUser, tenant } = value;
          return (
            <UserTool
              avatar={tenantUser ? tenantUser.avatar : userInfo.avatar}
              name={tenantUser ? tenantUser.name : userInfo.nickname}
              email={tenantUser ? tenantUser.email : userInfo.email}
              tenant={tenant}
              orgName={tenantUser && (tenantUser?.tenantOrgs || []).map(item => item.name).join(',')}
            />
          );
        }}
      </GlobalValue>
    </Flex>
  );
});

export default RightOptions;
