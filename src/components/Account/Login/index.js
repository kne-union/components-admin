import style from './style.module.scss';
import { Checkbox, Col, Row, Space, Button } from 'antd';
import { useState } from 'react';
import useNavigate from '@kne/use-refer-navigate';
import { createWithRemoteLoader } from '@kne/remote-loader';
import commonStyle from '../style.module.scss';

export const LOGIN_REMEMBER_ACCOUNT = 'LOGIN_REMEMBER_ACCOUNT';
const Login = createWithRemoteLoader({
  modules: ['component-core:FormInfo']
})(({ remoteModules, ...p }) => {
  const { title, registerUrl, forgetUrl, type, onSubmit } = Object.assign(
    {},
    {
      title: '登录',
      type: 'email',
      registerUrl: '',
      forgetUrl: ''
    },
    p
  );
  const [rememberUser, setRememberUser] = useState(false);
  const navigate = useNavigate();
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton, fields } = FormInfo;
  const { Input } = fields;
  return (
    <Form
      type="inner"
      size="large"
      enterSubmit
      onSubmit={formData => {
        if (rememberUser) {
          window.localStorage.setItem(LOGIN_REMEMBER_ACCOUNT, formData[type]);
        } else {
          window.localStorage.removeItem(LOGIN_REMEMBER_ACCOUNT);
        }
        onSubmit?.(formData);
      }}>
      <Space className="space-full" size={38} direction="vertical">
        <div className={commonStyle['title']}>{title}</div>
        <div>
          {type === 'email' && <Input name="email" label="邮箱" rule="REQ EMAIL" />}
          {type === 'phone' && <Input name="phone" label="手机" rule="REQ TEL" />}
          <Input.Password type="password" name="password" label="密码" rule="REQ LEN-6-50" />
        </div>
      </Space>
      <Space className="space-full" size={10} direction="vertical">
        <SubmitButton block size="large">
          登录
        </SubmitButton>
        <Row justify="space-between">
          <Col>
            <Checkbox
              checked={rememberUser}
              onChange={e => {
                setRememberUser(e.target.checked);
              }}>
              记住账号
            </Checkbox>
          </Col>
          <Col>
            {registerUrl && (
              <Button
                className={style['forget-button']}
                type="link"
                size="small"
                onClick={() => {
                  navigate(registerUrl);
                }}>
                注册
              </Button>
            )}
            {forgetUrl && (
              <Button
                className={style['forget-button']}
                type="link"
                size="small"
                onClick={() => {
                  navigate(forgetUrl);
                }}>
                忘记密码
              </Button>
            )}
          </Col>
        </Row>
      </Space>
    </Form>
  );
});

export default Login;
