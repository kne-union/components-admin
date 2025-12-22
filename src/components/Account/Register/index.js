import { useRef } from 'react';
import { Button, Col, Row, Space } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import CaptchaButton from '@kne/captcha-button';
import classnames from 'classnames';
import get from 'lodash/get';
import commonStyle from '../style.module.scss';
import { LeftOutlined } from '@ant-design/icons';
import useNavigate from '@kne/use-refer-navigate';
import style from './style.module.scss';

const Register = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, ...p }) => {
  const { onSubmit, title, systemName, type, sendVerificationCode, loginUrl, topBanner, className } = Object.assign(
    {},
    {
      title: '注册',
      type: 'email',
      loginUrl: '',
      sendVerificationCode: () => {
        console.warn('传入sendVerificationCode属性发送验证码');
      }
    },
    p
  );
  const formRef = useRef(null);
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton, fields } = FormInfo;
  const { Input, PhoneNumber } = fields;
  const navigate = useNavigate();
  return (
    <div className={classnames(commonStyle['out-container'], className)}>
      {topBanner && (
        <div className={commonStyle['top-banner']}>
          <div className={commonStyle['top-banner-inner']}>{systemName}</div>
          {topBanner}
        </div>
      )}
      <div className={commonStyle['out-inner']}>
        <Form type="inner" size="large" ref={formRef} onSubmit={onSubmit}>
          <Button
            className={commonStyle['back-link']}
            type="link"
            size="large"
            icon={<LeftOutlined />}
            onClick={() => {
              navigate(loginUrl);
            }}>
            已有账户，去登录
          </Button>
          <Space className={classnames(commonStyle['form-inner'])} size={38} direction="vertical">
            <div className={commonStyle['title']}>{title}</div>
            <div>
              {type === 'phone' && <PhoneNumber name="phone" label="手机" rule="REQ" codeType="code" realtime interceptor="phone-number-string" />}
              {type === 'email' && <Input name="email" label="邮箱" rule="REQ EMAIL" realtime />}
              <Row align={'bottom'} justify={'space-between'}>
                <Col className={style['code-field']}>
                  <Input name="code" label="验证码" rule="REQ LEN-6 VALIDATE_CODE" />
                </Col>
                <Col>
                  <CaptchaButton
                    className={style['get-code']}
                    type={'link'}
                    target={{ name: type }}
                    onClick={() => sendVerificationCode({ type, data: get(formRef.current.data, type) })}>
                    发送验证码
                  </CaptchaButton>
                </Col>
              </Row>
              <Input.Password name="password" label="密码" rule="REQ LEN-6-50" />
              <Input.Password name="repeatPwd" label="重复密码" rule="REQ LEN-6-50 REPEAT-password" />
            </div>
            <SubmitButton block size="large">
              注册
            </SubmitButton>
          </Space>
        </Form>
      </div>
    </div>
  );
});

export default Register;
