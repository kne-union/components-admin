import { createWithRemoteLoader } from '@kne/remote-loader';
import { Card, Typography } from 'antd';
import style from './style.module.scss';

const { Title, Paragraph } = Typography;

const UserCard = createWithRemoteLoader({
  modules: ['components-core:Image', 'components-core:InfoPage@SplitLine']
})(({ remoteModules, data }) => {
  const [Image, SplitLine] = remoteModules;

  return (
    <Card className={style['card']}>
      <div className={style['avatar']}>
        <Image.Avatar size={100} id={data.avatar} />
      </div>
      <Title level={4}>{data.name}</Title>
      {data.tenantOrg && (
        <Title level={5} type="secondary">
          {data.tenantOrg.name}
        </Title>
      )}
      <SplitLine
        dataSource={data}
        columns={[
          {
            name: 'phone',
            title: '手机号'
          },
          {
            name: 'email',
            title: '邮箱'
          }
        ]}
      />
      <Paragraph>{data.description}</Paragraph>
    </Card>
  );
});

export default UserCard;
