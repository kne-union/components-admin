import '@kne/react-box/dist/index.css';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIsMobile } from '@kne/responsive-utils';
import { Empty, Row, Col } from 'antd';
import { PersonalCard } from '@kne/react-box';
import style from '../style.module.scss';

const TeamDescription = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, data }) => {
  const [Image] = remoteModules;
  const isMobile = useIsMobile();

  if (!(data.teamDescription && data.teamDescription.length > 0)) {
    return <Empty />;
  }

  const teamColProps = isMobile ? { span: 24 } : { xs: 24, md: 12, lg: 8 };

  return (
    <div className={style.teamPanel}>
      <Row gutter={isMobile ? [0, 12] : [16, 16]} justify={isMobile ? 'stretch' : 'center'}>
        {data.teamDescription.map((item, index) => (
          <Col {...teamColProps} key={index}>
            <div className={style.teamCard}>
              <PersonalCard
                avatar={({ className }) => <Image.Avatar className={className} size={'100%'} id={item.avatar} />}
                name={item.name}
                title={item.role}
                description={item.description}
                status="online"
                mode="vertical"
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
});

export default TeamDescription;
export { default as FormInner } from './FormInner';
