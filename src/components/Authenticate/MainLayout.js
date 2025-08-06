import RemoteLoader, { createWithRemoteLoader } from '@kne/remote-loader';
import { Outlet } from 'react-router-dom';
import { SuperAdminInfo, UserInfo, CustomUserInfo } from './Authenticate';
import UserTool from '@components/UserTool';

export const MainLayout = createWithRemoteLoader({
  modules: ['components-core:Layout']
})(({ remoteModules, navigation, title, children }) => {
  const [Layout] = remoteModules;
  return (
    <Layout
      navigation={{
        defaultTitle: title,
        ...Object.assign({}, navigation)
      }}
    >
      {children}
    </Layout>
  );
});

export const RightOptions = createWithRemoteLoader({
  modules: ['components-core:Global@GetGlobal']
})(({ remoteModules }) => {
  const [GetGlobal] = remoteModules;

  return (
    <GetGlobal globalKey="userInfo">
      {({ value }) => {
        const { nickname, avatar, email } = Object.assign({}, value?.value);
        return <UserTool name={nickname} email={email} avatar={avatar} />;
      }}
    </GetGlobal>
  );
});

export const AfterCustomUserLoginLayout = ({ baseUrl, navigation, api, ...props }) => {
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
        )}
      >
        <Outlet />
      </MainLayout>
    </CustomUserInfo>
  );
};

export const AfterCustomUserLogin = ({ baseUrl, api, ...props }) => {
  return (
    <CustomUserInfo baseUrl={baseUrl || '/account'} api={api}>
      <Outlet />
    </CustomUserInfo>
  );
};

export const AfterUserLoginLayout = ({ baseUrl, navigation, ...props }) => {
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
        )}
      >
        <Outlet />
      </MainLayout>
    </UserInfo>
  );
};

export const AfterUserLogin = ({ baseUrl, ...props }) => {
  return (
    <UserInfo baseUrl={baseUrl || '/account'}>
      <Outlet />
    </UserInfo>
  );
};

export const AfterAdminUserLoginLayout = ({ navigation, ...props }) => {
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
        )}
      >
        <Outlet />
      </MainLayout>
    </SuperAdminInfo>
  );
};

export const BeforeLoginLayout = props => {
  return (
    <>
      <Outlet />
    </>
  );
};
