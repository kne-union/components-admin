import { createWithRemoteLoader } from '@kne/remote-loader';
import classnames from 'classnames';
import hello from '../lottieData/hello.json';
import style from './style.module.scss';

const Hello = createWithRemoteLoader({
  modules: ['components-thirdparty:LottiePlayer']
})(({ remoteModules }) => {
  const [LottiePlayer] = remoteModules;
  return (
    <div className={style['hello-container']}>
      <LottiePlayer renderer="svg" animationData={hello} className={classnames(style['animation'], 'animation')} />
    </div>
  );
});

export default Hello;
