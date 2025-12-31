import { createWithRemoteLoader } from '@kne/remote-loader';

const GroupSelect = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {

  return <div>unleash creativity</div>;
});

export default GroupSelect;
