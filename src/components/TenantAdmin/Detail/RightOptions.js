import { createWithRemoteLoader } from '@kne/remote-loader';
import { Tabs } from 'antd';

const RightOptions = createWithRemoteLoader({
  modules: []
})(({ remoteModules }) => {
  const [] = remoteModules;
  return (
    <Tabs
      items={[
        {
          key: '1',
          label: '状态一',
          children: ''
        },
        {
          key: '2',
          label: '状态二',
          children: ''
        }
      ]}
    />
  );
});

export default RightOptions;
