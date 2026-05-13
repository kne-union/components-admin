import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';

const MessageMenu = createWithRemoteLoader({
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
          { label: formatMessage({ id: 'TemplateList' }), key: 'templates', path: `${rootPath}/templates` },
          { label: formatMessage({ id: 'RecordList' }), key: 'records', path: `${rootPath}/records` }
        ]}
      />
    );
  })
);

export default MessageMenu;
