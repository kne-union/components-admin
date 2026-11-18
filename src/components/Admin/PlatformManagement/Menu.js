import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

/**
 * 平台管理左侧菜单：认证管理（原 Oidc 子项作二级）+ 平台关联
 */
const PlatformMenu = createWithRemoteLoader({
  modules: ['components-core:Menu', 'components-core:Global@useGlobalContext']
})(
  withLocale(({ remoteModules, baseUrl }) => {
    const [Menu, useGlobalContext] = remoteModules;
    const { formatMessage } = useIntl();
    const { global } = useGlobalContext('userInfo');
    const appOpsEnabled = !!global?.setting?.appOpsEnabled;
    const root = (baseUrl || '').replace(/\/$/, '');
    const oidcRoot = `${root}/oidc`;

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
      }
    ].filter(Boolean);

    return <Menu items={items} />;
  })
);

export default PlatformMenu;
