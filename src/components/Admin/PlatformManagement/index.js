import AppChildrenRouter from '@kne/app-children-router';
import RemoteLoader from '@kne/remote-loader';
import { Navigate } from 'react-router-dom';
import OidcAdmin from '@components/OidcAdmin';
import withLocale from '../withLocale';
import PlatformMenu from './Menu';
import Mcp from './Mcp';

/**
 * 平台管理：左栏「认证管理 / 平台关联 / MCP」，认证下挂原 OidcAdmin 子页
 */
const PlatformManagement = withLocale(({ baseUrl, pageProps = {}, mcpServerName = 'mcp' }) => {
  // 与菜单一致：避免 baseUrl 缺失时拼出相对路径 "undefined/oidc"
  const root = (baseUrl || '').replace(/\/$/, '');
  const menu = <PlatformMenu baseUrl={root} />;
  // 与任务管理一致：左侧菜单默认 menuFixed=true，滚动内容区时菜单固定
  const sharedPageProps = Object.assign({ menuFixed: true }, pageProps, { menu });
  const oidcBase = `${root}/oidc`;
  const mcpBase = `${root}/mcp`;

  return (
    <AppChildrenRouter
      errorPage
      notFoundPage
      baseUrl={root}
      list={[
        {
          index: true,
          element: <Navigate to={oidcBase} replace />
        },
        {
          path: 'oidc/*',
          element: <OidcAdmin baseUrl={oidcBase} pageProps={sharedPageProps} />
        },
        {
          path: 'link/*',
          element: <RemoteLoader module="components-app-manager:PlatformLink" menu={menu} menuFixed={sharedPageProps.menuFixed !== false} />
        },
        {
          path: 'mcp/*',
          element: <Mcp baseUrl={mcpBase} pageProps={sharedPageProps} serverName={mcpServerName} />
        }
      ]}
    />
  );
});

export default PlatformManagement;
export { PlatformMenu };
export { default as Mcp } from './Mcp';
export { default as McpSettings } from './Mcp/Settings';
