import { createWithRemoteLoader } from '@kne/remote-loader';
import { Empty } from 'antd';
import dayjs from 'dayjs';
import Timeline from '@kne/timeline';
import withLocale from '../../withLocale';
import style from '../style.module.scss';

const formatTime = time => {
  if (!time) return '';
  const d = dayjs(time);
  if (!d.isValid()) return String(time);
  return d.format('YYYY.MM');
};

const resolveImageSrc = (id, origin) => {
  if (typeof id === 'string' && /^https?:\/\//i.test(id)) {
    return id;
  }
  return `${origin}/api/v1/static/file-id/${id}`;
};

const DevelopmentHistory = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data }) => {
    const [usePreset] = remoteModules;
    const { staticUrl } = usePreset();
    const list = data.developmentHistory;

    if (!(list && list.length > 0)) {
      return <Empty />;
    }

    const origin = (typeof staticUrl === 'string' && staticUrl) || (typeof window !== 'undefined' ? window.location.origin : '');

    const timelineData = list.map(item => {
      const row = {
        title: formatTime(item.time),
        content: item.event
      };
      if (item.images && item.images.length > 0) {
        row.images = item.images.map(id => ({
          src: resolveImageSrc(id, origin)
        }));
      }
      if (item.extra) {
        row.extra = item.extra;
      }
      return row;
    });

    return (
      <div className={style.timelinePanel}>
        <Timeline data={timelineData} />
      </div>
    );
  })
);

export default DevelopmentHistory;

export { default as FormInner } from './FormInner';
