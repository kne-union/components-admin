import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';

const Menu = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(
  withLocale(({ remoteModules, baseUrl }) => {
    const [Menu] = remoteModules;
    const { formatMessage } = useIntl();
    const rootPath = baseUrl || '';

    return (
      <Menu
        items={[
          { label: formatMessage({ id: 'ClientManager' }), key: 'clients', path: rootPath },
          { label: formatMessage({ id: 'ResourceServerManager' }), key: 'resourceServers', path: `${rootPath}/resource-servers` },
          { label: formatMessage({ id: 'KeyManager' }), key: 'keys', path: `${rootPath}/keys` },
          { label: formatMessage({ id: 'SessionManager' }), key: 'sessions', path: `${rootPath}/sessions` }
        ]}
      />
    );
  })
);

export default Menu;
