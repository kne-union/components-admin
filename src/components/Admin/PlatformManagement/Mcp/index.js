import AppChildrenRouter from '@kne/app-children-router';
import Settings from './Settings';
import Keys from './Keys';

/**
 * 平台 MCP：开放能力（admin allowlist）+ 超管为指定用户签发密钥（admin mcp-keys）。
 * 菜单显隐由 getSuperAdminInfo.setting.mcpEnabled 控制。
 */
const Mcp = ({ baseUrl, pageProps = {}, serverName = 'mcp' }) => {
  return (
    <AppChildrenRouter
      errorPage
      notFoundPage
      baseUrl={baseUrl}
      list={[
        {
          index: true,
          element: <Settings pageProps={pageProps} />
        },
        {
          path: 'keys',
          element: <Keys pageProps={pageProps} serverName={serverName} />
        }
      ]}
    />
  );
};

export default Mcp;
export { default as Settings } from './Settings';
export { default as Keys } from './Keys';
