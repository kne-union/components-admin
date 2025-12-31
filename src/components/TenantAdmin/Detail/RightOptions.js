import { createWithRemoteLoader } from '@kne/remote-loader';
import { Tabs } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const RightOptionsInner = createWithRemoteLoader({
  modules: []
})(({ remoteModules }) => {
  const [] = remoteModules;
  const { formatMessage } = useIntl();
  return (
    <Tabs
      items={[
        {
          key: '1',
          label: formatMessage({ id: 'Status' }) + '一',
          children: ''
        },
        {
          key: '2',
          label: formatMessage({ id: 'Status' }) + '二',
          children: ''
        }
      ]}
    />
  );
});

export default withLocale(RightOptionsInner);
