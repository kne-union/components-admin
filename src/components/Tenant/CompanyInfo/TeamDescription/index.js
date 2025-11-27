import { createWithRemoteLoader } from '@kne/remote-loader';
import { Card, Empty, Typography, Row, Col } from 'antd';
import style from '../style.module.scss';

const { Title, Paragraph } = Typography;

const TeamMember = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, avatar, name, role, description }) => {
  const [Image] = remoteModules;
  return (
    <Card className={style['team-card']}>
      <div className={style['member-avatar']}>
        <Image.Avatar size={100} id={avatar} />
      </div>
      <Title level={4}>{name}</Title>
      <Title level={5} type="secondary">
        {role}
      </Title>
      <Paragraph>{description}</Paragraph>
    </Card>
  );
});

const TeamDescription = ({ data }) => {
  if (!(data.teamDescription && data.teamDescription.length > 0)) {
    return <Empty />;
  }

  return (
    <div className={style['section']}>
      <Row gutter={[24, 24]} justify="center">
        {data.teamDescription.map((item, index) => {
          return (
            <Col xs={24} sm={12} lg={8} key={index}>
              <TeamMember avatar={item.avatar} name={item.name} role={item.role} description={item.description} />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default TeamDescription;
export { default as FormInner } from './FormInner';
