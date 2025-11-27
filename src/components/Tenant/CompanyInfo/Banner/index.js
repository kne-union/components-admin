import { createWithRemoteLoader } from '@kne/remote-loader';
import { Carousel } from 'antd';
import style from '../style.module.scss';

const Banner = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, data }) => {
  const [Image] = remoteModules;
  if (!(data.banners && data.banners.length > 0)) {
    return null;
  }
  return (
    <div className={style['section']}>
      <Carousel arrows autoplay className={style['images']}>
        {data.banners.map((image, index) => {
          return (
            <div key={index}>
              <Image id={image} className={style['image-item']} />
            </div>
          );
        })}
      </Carousel>
    </div>
  );
});

export default Banner;
export { default as FormInner } from './FormInner';
