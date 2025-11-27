import { Timeline, Empty } from 'antd';
import dayjs from 'dayjs';
import style from '../style.module.scss';

const DevelopmentHistory = ({ data }) => {
  if (!(data.developmentHistory && data.developmentHistory.length > 0)) {
    return <Empty />;
  }
  return (
    <div className={style['section']}>
      <Timeline
        mode="left"
        className={style['timeline']}
        items={data.developmentHistory.map(item => {
          return {
            label: dayjs(item.time).format('YYYY年MM月DD日'),
            children: item.event
          };
        })}
      />
    </div>
  );
};

export default DevelopmentHistory;

export { default as FormInner } from './FormInner';
