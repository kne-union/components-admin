import '@kne/react-box/dist/index.css';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { Divider } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import MessageMenu from '../Menu';
import RealtimeSection from './RealtimeSection';
import HistorySection from './HistorySection';
import style from './dashboard.module.scss';

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
        menu={<MessageMenu baseUrl={baseUrl} />}
        children={
          <div className={style.dashboardRoot}>
            <div className={`${style.sectionPanel} ${style.realtimeSectionWrap}`}>
              <RealtimeSection apis={apis} ajax={ajax} />
            </div>
            <Divider className={style.sectionDivider} />
            <div className={style.sectionPanel}>
              <HistorySection apis={apis} />
            </div>
          </div>
        }
      />
    );
  })
);

export default Dashboard;
