import { Row, Col, Flex } from 'antd';
import classnames from 'classnames';
import LoginIllustration from '@components/LoginIllustration';
import style from './style.module.scss';
import commonStyle from '../style.module.scss';

const renderLogo = logo => {
  if (!logo) {
    return null;
  }
  if (typeof logo === 'string') {
    return <img className={classnames(style['container-left-logo'], 'container-left-logo')} src={logo} alt="logo" />;
  }
  return <span className={classnames(style['container-left-logo'], style['container-left-logo-node'], 'container-left-logo')}>{logo}</span>;
};

const LoginOuterContainer = ({ className, title, logo, leftInner = <LoginIllustration />, children }) => {
  return (
    <div className={classnames(className, commonStyle['out-container'], 'account-box')}>
      <div className={commonStyle['top-banner']}>
        <div className={commonStyle['top-banner-inner']}>{title}</div>
        {leftInner}
      </div>
      <div className={commonStyle['out-inner']}>
        <Row wrap={false}>
          <Col className={classnames(style['out-left'], 'container-left')}>
            <Flex gap={16} align="center" className={classnames(style['container-left-content'], 'container-left-content')}>
              {renderLogo(logo)}
              {title && <div className={classnames(style['container-left-title'], 'container-left-title')}>{title}</div>}
            </Flex>
            {leftInner && <div className={classnames(style['container-left-inner'], 'container-left-inner')}>{leftInner}</div>}
          </Col>
          <Col className={classnames(style['out-right'], 'container-right')} flex={1}>
            <div className={classnames(style['out-right-inner'], 'container-right-inner')}>{children}</div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LoginOuterContainer;
