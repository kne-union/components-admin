import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
const Hello = createWithRemoteLoader({
  modules: ['components-thirdparty:LottiePlayer']
})(({ remoteModules }) => {
  const [LottiePlayer] = remoteModules;
  return (
    <Fetch
      loader={async () => {
        return import('../lottieData/hello.json').then(module => module.default);
      }}
      render={({ data }) => {
        console.log(data);
        return <div></div>;
      }}
    />
  );
});

export default Hello;
