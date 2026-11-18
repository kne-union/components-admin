import AppChildrenRouter from '@kne/app-children-router';
import RemoteLoader from '@kne/remote-loader';
import { Navigate } from 'react-router-dom';
import OidcAdmin from '@components/OidcAdmin';
import withLocale from '../withLocale';
import PlatformMenu from './Menu';

/**
 * 平台管理：左栏「认证管理 / 平台关联」，认证下挂原 OidcAdmin 子页
 */
const PlatformManagement = withLocale(({ baseUrl, pageProps = {} }) => {
  const menu = <PlatformMenu baseUrl={baseUrl} />;
  const sharedPageProps = Object.assign({}, pageProps, { menu, menuFixed: false });
  const oidcBase = `${baseUrl}/oidc`;

  return (
    <AppChildrenRouter
      errorPage
      notFoundPage
      baseUrl={baseUrl}
      list={[
        {
          index: true,
          element: <Navigate to={`${baseUrl}/oidc`} replace />
        },
        {
          path: 'oidc/*',
          element: <OidcAdmin baseUrl={oidcBase} pageProps={sharedPageProps} />
        },
        {
          path: 'link/*',
          element: <RemoteLoader module="components-app-manager:PlatformLink" menu={menu} menuFixed={false} />
        }
      ]}
    />
  );
});

export default PlatformManagement;
export { PlatformMenu };
