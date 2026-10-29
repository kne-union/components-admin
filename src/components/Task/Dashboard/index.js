import '@kne/react-box/dist/index.css';
import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import TaskMenu from '../Menu';
import RealtimeSection from './RealtimeSection';
import HistorySection from './HistorySection';
import style from '../../../utils/dashboard/dashboard.module.scss';

const Dashboard = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@Page']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Page] = remoteModules;
    const { apis, ajax } = usePreset();
    const { formatMessage } = useIntl();

    return (
      <Page
        {...pageProps}
        title={formatMessage({ id: 'Dashboard' })}
        menu={<TaskMenu baseUrl={baseUrl} />}
        children={
          <div className={style.dashboardRoot}>
            <RealtimeSection apis={apis} ajax={ajax} baseUrl={baseUrl} />
            <HistorySection apis={apis} />
          </div>
        }
      />
    );
  })
);

export default Dashboard;
