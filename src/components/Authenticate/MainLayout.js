import { createWithRemoteLoader } from '@kne/remote-loader';
import { Outlet } from 'react-router-dom';
import { LoginOutlined } from '@ant-design/icons';
import { SuperAdminInfo, UserInfo, CustomUserInfo } from './Authenticate';
import UserTool from '@components/UserTool';
import Language from '@components/Account/Language';
import { Flex, Button } from 'antd';

export const MainLayout = createWithRemoteLoader({
  modules: ['components-core:Layout']
})(({ remoteModules, navigation, title, children }) => {
  const [Layout] = remoteModules;
  return (
    <Layout
      navigation={{
        defaultTitle: title,
        ...Object.assign({}, navigation)
      }}>
      {children}
    </Layout>
  );
});

export const RightOptions = createWithRemoteLoader({
  modules: ['components-core:Global@GlobalValue']
})(({ remoteModules }) => {
  const [GlobalValue] = remoteModules;

  return (
    <Flex gap={8}>
      <Language />
      <GlobalValue globalKey="userInfo">
        {({ value }) => {
          const { nickname, avatar, email } = Object.assign({}, value?.value);
          return <UserTool name={nickname} email={email} avatar={avatar} />;
        }}
      </GlobalValue>
    </Flex>
  );
});

export const AfterCustomUserLoginLayout = ({ baseUrl, navigation, api, children, ...props }) => {
  return (
    <CustomUserInfo baseUrl={baseUrl || '/account'} api={api}>
      <MainLayout
        {...props}
        navigation={Object.assign(
          {},
          {
            rightOptions: <RightOptions />
          },
          navigation
        )}>
        {children || <Outlet />}
      </MainLayout>
    </CustomUserInfo>
  );
};

export const AfterCustomUserLogin = ({ baseUrl, api, children, ...props }) => {
  return (
    <CustomUserInfo baseUrl={baseUrl || '/account'} api={api}>
      {children || <Outlet />}
    </CustomUserInfo>
  );
};

export const AfterUserLoginLayout = ({ baseUrl, navigation, children, ...props }) => {
  return (
    <UserInfo baseUrl={baseUrl || '/account'}>
      <MainLayout
        {...props}
        navigation={Object.assign(
          {},
          {
            rightOptions: <RightOptions />
          },
          navigation
        )}>
        {children || <Outlet />}
      </MainLayout>
    </UserInfo>
  );
};

export const Layout = props => {
  return (
    <UserInfo
      options={{
        ignoreRedirect: true
      }}
      error={() => (
        <MainLayout
          {...props}
          navigation={Object.assign({}, props.navigation, {
            rightOptions: props.login && (
              <Button className="right-options-login"
                type="link"
                icon={<LoginOutlined />}
                onClick={() => {
                  props.login();
                }}
                iconPosition="end">
                登录
              </Button>
            )
          })}>
          <Outlet />
        </MainLayout>
      )}>
      <AfterUserLoginLayout {...props} />
    </UserInfo>
  );
};

export const AfterUserLogin = ({ baseUrl, children, ...props }) => {
  return <UserInfo baseUrl={baseUrl || '/account'}>{children || <Outlet />}</UserInfo>;
};

export const AfterAdminUserLoginLayout = ({ navigation, children, ...props }) => {
  return (
    <SuperAdminInfo>
      <MainLayout
        {...props}
        navigation={Object.assign(
          {},
          {
            rightOptions: <RightOptions />
          },
          navigation
        )}>
        {children || <Outlet />}
      </MainLayout>
    </SuperAdminInfo>
  );
};

export const BeforeLoginLayout = ({ children, ...props }) => {
  return <>{children || <Outlet />}</>;
};
