import '@kne/react-box/dist/index.css';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { Empty, Row, Col } from 'antd';
import { PersonalCard } from '@kne/react-box';

const TeamDescription = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, data }) => {
  const [Image] = remoteModules;
  if (!(data.teamDescription && data.teamDescription.length > 0)) {
    return <Empty />;
  }

  return (
    <Row gutter={[16, 16]} justify="center">
      {data.teamDescription.map((item, index) => (
        <Col xs={24} sm={12} lg={8} key={index}>
          <PersonalCard
            avatar={({ className }) => <Image.Avatar className={className} size={'100%'} id={item.avatar} />}
            name={item.name}
            title={item.role}
            description={item.description}
            status="online"
            mode="vertical"
          />
        </Col>
      ))}
    </Row>
  );
});

export default TeamDescription;
export { default as FormInner } from './FormInner';
