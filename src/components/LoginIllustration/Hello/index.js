import { createWithRemoteLoader } from '@kne/remote-loader';
import hello from '../lottieData/hello.json';
import style from './style.module.scss';

const Hello = createWithRemoteLoader({
  modules: ['components-thirdparty:LottiePlayer']
})(({ remoteModules }) => {
  const [LottiePlayer] = remoteModules;
  return <div className={style['hello-container']}>
    <LottiePlayer renderer="svg" animationData={hello} className={style['animation']}/>
  </div>;
});

export default Hello;
