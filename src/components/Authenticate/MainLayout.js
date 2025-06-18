import RemoteLoader, { createWithRemoteLoader } from '@kne/remote-loader';
import { Outlet } from 'react-router-dom';
import { SuperAdminInfo, UserInfo } from './Authenticate';
import UserTool from '@components/UserTool';

const MainLayout = createWithRemoteLoader({
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

export const AfterUserLoginLayout = ({ baseUrl, navigation, ...props }) => {
  return (
    <UserInfo baseUrl={baseUrl || '/account'}>
      <MainLayout
        {...props}
        navigation={Object.assign({}, navigation, {
          rightOptions: (
            <RemoteLoader module="components-core:Global@GetGlobal" globalKey="userInfo">
              {({ value }) => {
                const { nickname, avatar, email } = Object.assign({}, value?.value);
                return <UserTool name={nickname} email={email} avatar={avatar} />;
              }}
            </RemoteLoader>
          )
        })}
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
        navigation={Object.assign({}, navigation, {
          rightOptions: (
            <RemoteLoader module="components-core:Global@GetGlobal" globalKey="userInfo">
              {({ value }) => {
                const { nickname, avatar, email } = Object.assign({}, value?.value);
                return <UserTool name={nickname} email={email} avatar={avatar} />;
              }}
            </RemoteLoader>
          )
        })}
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
