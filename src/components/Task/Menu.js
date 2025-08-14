import { createWithRemoteLoader } from '@kne/remote-loader';

const Menu = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(({ remoteModules, baseUrl }) => {
  const [Menu] = remoteModules;

  return (
    <Menu
      items={[
        { label: '我的任务', key: 'myTask', path: `${baseUrl}/task` },
        {
          label: '全部任务',
          key: 'task',
          path: `${baseUrl}/task/all`
        }
      ]}
    />
  );
});

export default Menu;
