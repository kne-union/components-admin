import { createWithRemoteLoader } from '@kne/remote-loader';
import { Outlet } from 'react-router-dom';
import { SuperAdminInfo, UserInfo } from './Authenticate';

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

export const AfterUserLoginLayout = ({ baseUrl, ...props }) => {
  return (
    <MainLayout {...props}>
      <UserInfo baseUrl={baseUrl || '/account'}>
        <Outlet />
      </UserInfo>
    </MainLayout>
  );
};

export const AfterUserLogin = ({ baseUrl, ...props }) => {
  return (
    <UserInfo baseUrl={baseUrl || '/account'}>
      <Outlet />
    </UserInfo>
  );
};

export const AfterAdminUserLoginLayout = props => {
  return (
    <MainLayout {...props}>
      <SuperAdminInfo>
        <Outlet />
      </SuperAdminInfo>
    </MainLayout>
  );
};

export const BeforeLoginLayout = props => {
  return (
    <>
      <Outlet />
    </>
  );
};
