import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

/**
 * 平台管理左侧菜单：认证管理（原 Oidc 子项作二级）+ 平台关联 + MCP（开放能力 / 密钥）
 * - 平台关联：setting.appOpsEnabled
 * - MCP：setting.mcpEnabled（宿主 getAdminSetting 注入，如 !!fastify.mcp）
 */
const PlatformMenu = createWithRemoteLoader({
  modules: ['components-core:Menu', 'components-core:Global@useGlobalContext']
})(
  withLocale(({ remoteModules, baseUrl }) => {
    const [Menu, useGlobalContext] = remoteModules;
    const { formatMessage } = useIntl();
    const { global } = useGlobalContext('userInfo');
    const appOpsEnabled = !!global?.setting?.appOpsEnabled;
    const mcpEnabled = !!global?.setting?.mcpEnabled;
    const root = (baseUrl || '').replace(/\/$/, '');
    const oidcRoot = `${root}/oidc`;
    const mcpRoot = `${root}/mcp`;

    const items = [
      {
        label: formatMessage({ id: 'NavAuthManagement' }),
        key: 'auth',
        children: [
          { label: formatMessage({ id: 'NavOidcClients' }), key: 'clients', path: oidcRoot },
          { label: formatMessage({ id: 'NavOidcResourceServers' }), key: 'resourceServers', path: `${oidcRoot}/resource-servers` },
          { label: formatMessage({ id: 'NavOidcKeys' }), key: 'keys', path: `${oidcRoot}/keys` },
          { label: formatMessage({ id: 'NavOidcSessions' }), key: 'sessions', path: `${oidcRoot}/sessions` },
          { label: formatMessage({ id: 'NavOidcApps' }), key: 'apps', path: `${oidcRoot}/apps` }
        ]
      },
      appOpsEnabled && {
        label: formatMessage({ id: 'NavPlatformLink' }),
        key: 'platform-link',
        path: `${root}/link`
      },
      mcpEnabled && {
        label: formatMessage({ id: 'NavMcp' }),
        key: 'mcp',
        children: [
          { label: formatMessage({ id: 'NavMcpSettings' }), key: 'mcp-settings', path: mcpRoot },
          { label: formatMessage({ id: 'NavMcpKeys' }), key: 'mcp-keys', path: `${mcpRoot}/keys` }
        ]
      }
    ].filter(Boolean);

    return <Menu items={items} />;
  })
);

export default PlatformMenu;
