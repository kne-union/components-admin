import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import Authenticate from './Authenticate';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';

const AfterTenantLoginLayout = createWithRemoteLoader({
  modules: ['components-admin:Authenticate@MainLayout', 'components-admin:UserTool']
})(({ remoteModules, navigation, switchTenantPath, children, ...props }) => {
  const [MainLayout, UserTool] = remoteModules;
  const { formatMessage } = useIntl();
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
                              {formatMessage({ id: 'SwitchTenant' })}
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
            {children || <Outlet />}
          </MainLayout>
        );
      }}
    </Authenticate>
  );
});

export default withLocale(AfterTenantLoginLayout);
