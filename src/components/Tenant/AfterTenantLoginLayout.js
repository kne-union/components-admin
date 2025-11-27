import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import Authenticate from './Authenticate';

const AfterTenantLoginLayout = createWithRemoteLoader({
  modules: ['components-admin:Authenticate@MainLayout', 'components-admin:UserTool']
})(({ remoteModules, navigation, switchTenantPath, ...props }) => {
  const [MainLayout, UserTool] = remoteModules;
  const navigate = useNavigate();
  return (
    <Authenticate>
      {({ global }) => {
        const { tenantUserInfo, company, tenant } = global;
        return (
          <MainLayout
            {...props}
            navigation={Object.assign(
              {},
              {
                headerLogo: {
                  style: { width: '108px' },
                  id: tenant.logo
                },
                rightOptions: (
                  <UserTool
                    name={tenantUserInfo.name}
                    email={tenantUserInfo.email || tenantUserInfo.phone}
                    avatar={tenantUserInfo.avatar}
                    list={[
                      {
                        label: (
                          <Flex justify="space-between" flex={1} gap={8}>
                            <span key="name">{company.name}</span>
                            <Button
                              key="btn"
                              type="link"
                              className="btn-no-padding"
                              onClick={() => {
                                navigate(switchTenantPath);
                              }}>
                              切换租户
                            </Button>
                          </Flex>
                        ),
                        iconType: 'gongsi'
                      }
                    ]}
                  />
                )
              },
              navigation
            )}>
            <Outlet />
          </MainLayout>
        );
      }}
    </Authenticate>
  );
});

export default AfterTenantLoginLayout;
