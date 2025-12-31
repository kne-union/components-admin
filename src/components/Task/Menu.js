import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';

const Menu = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(withLocale(({ remoteModules, baseUrl }) => {
  const [Menu] = remoteModules;
  const { formatMessage } = useIntl();

  return (
    <Menu
      items={[
        { label: formatMessage({ id: 'MyTask' }), key: 'myTask', path: `${baseUrl}/task` },
        {
          label: formatMessage({ id: 'AllTask' }),
          key: 'task',
          path: `${baseUrl}/task/all`
        }
      ]}
    />
  );
}));

export default Menu;
