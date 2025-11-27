import { createWithRemoteLoader } from '@kne/remote-loader';
import { Typography, Empty } from 'antd';
import style from '../style.module.scss';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

const Basic = createWithRemoteLoader({
  modules: ['components-core:InfoPage@Content']
})(({ remoteModules, data }) => {
  const [Content] = remoteModules;
  return (
    <div className={style['section']}>
      <Content
        col={2}
        list={[
          {
            label: '公司名称',
            content: data.name || '-'
          },
          {
            label: '公司全称',
            content: data.fullName || '-'
          },
          {
            label: '公司主页',
            content: data.website ? (
              <Typography.Link href={data.website} target="_blank">
                {data.website}
              </Typography.Link>
            ) : (
              '-'
            )
          },
          {
            label: '公司简介',
            content: data.description || '-',
            block: true
          }
        ]}
      />
    </div>
  );
});

export default Basic;
export { default as FormInner } from './FormInner';
