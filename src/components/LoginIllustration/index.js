import { createWithRemoteLoader } from '@kne/remote-loader';
import style from './style.module.scss';

const LoginIllustration = createWithRemoteLoader({
  modules: ['components-thirdparty:LottiePlayer']
})(({ remoteModules }) => {
  const [LottiePlayer] = remoteModules;
  return <div>unleash creativity</div>;
});

export default LoginIllustration;
