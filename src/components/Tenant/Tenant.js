import { createWithRemoteLoader } from '@kne/remote-loader';
import AppChildrenRouter from '@kne/app-children-router';
import AfterTenantLoginLayout from './AfterTenantLoginLayout';

const Tenant = createWithRemoteLoader({
  modules: ['components-admin:Authenticate@AfterUserLoginLayout']
})(({ remoteModules, baseUrl, navigation = {}, list = [], ...props }) => {
  const [AfterUserLoginLayout] = remoteModules;
  return (
    <AppChildrenRouter
      {...props}
      baseUrl={baseUrl}
      list={[
        {
          path: 'tenant/*',
          element: (
            <AppChildrenRouter
              errorPage
              notFoundPage
              baseUrl={`${baseUrl}/tenant`}
              element={
                <AfterTenantLoginLayout
                  navigation={{
                    base: `${baseUrl}/tenant`,
                    showIndex: false,
                    list: [
                      ...(navigation.list || []),
                      {
                        key: 'setting',
                        title: '系统设置',
                        path: `${baseUrl}/tenant/setting`
                      }
                    ]
                  }}
                  switchTenantPath={`${baseUrl}/login-tenant`}
                />
              }
              list={[
                ...list,
                {
                  path: 'setting/*',
                  loader: () => import('./Setting')
                }
              ]}
            />
          )
        },
        {
          path: '*',
          element: (
            <AppChildrenRouter
              errorPage
              notFoundPage
              baseUrl={baseUrl}
              element={<AfterUserLoginLayout />}
              list={[
                {
                  path: 'join-tenant',
                  loader: () => import('./JoinInvitation')
                },
                {
                  path: 'login-tenant',
                  elementProps: {
                    tenantPath: `${baseUrl}/tenant`
                  },
                  loader: () => import('./LoginTenant')
                }
              ]}
            />
          )
        }
      ]}
    />
  );
});

export default Tenant;
