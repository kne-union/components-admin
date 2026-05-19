import { createWithRemoteLoader } from '@kne/remote-loader';
import { Card, Typography, Flex } from 'antd';
import UserOrgTags from '../UserOrgTags';
import getUserOrgDisplayItems from '../getUserOrgDisplayItems';
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
      {getUserOrgDisplayItems(data).length > 0 && (
        <Flex justify="center" className={style.orgs}>
          <UserOrgTags item={data} maxVisible={4} />
        </Flex>
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
          },
          {
            name: 'roleDetails',
            title: '角色',
            render: item => {
              return item.map(item => item.name).join(',') || '默认角色';
            }
          }
        ]}
      />
      <Paragraph>{data.description}</Paragraph>
    </Card>
  );
});

export default UserCard;
