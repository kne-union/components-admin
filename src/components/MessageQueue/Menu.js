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
          { label: formatMessage({ id: 'Dashboard' }), key: 'dashboard', path: rootPath },
          { label: formatMessage({ id: 'MessageList' }), key: 'messages', path: `${rootPath}/messages` },
          { label: formatMessage({ id: 'DeadLetterList' }), key: 'deadLetters', path: `${rootPath}/dead-letter` },
          { label: formatMessage({ id: 'TraceList' }), key: 'traces', path: `${rootPath}/traces` },
          { label: formatMessage({ id: 'QueueTools' }), key: 'tools', path: `${rootPath}/tools` }
        ]}
      />
    );
  })
);

export default Menu;
