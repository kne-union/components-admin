import style from './style.module.scss';
import { Checkbox, Col, Row, Space, Button, Flex } from 'antd';
import { useState } from 'react';
import useNavigate from '@kne/use-refer-navigate';
import { createWithRemoteLoader } from '@kne/remote-loader';
import commonStyle from '../style.module.scss';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

export const LOGIN_REMEMBER_ACCOUNT = 'LOGIN_REMEMBER_ACCOUNT';
const LoginInner = createWithRemoteLoader({
  modules: ['component-core:FormInfo']
})(({ remoteModules, ...p }) => {
  const { formatMessage } = useIntl();
  const { title, registerUrl, forgetUrl, type, onSubmit } = Object.assign(
    {},
    {
      title: formatMessage({ id: 'Login' }),
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
          {type === 'email' && <Input name="email" label={formatMessage({ id: 'Email' })} rule="REQ EMAIL" />}
          {type === 'phone' && <Input name="phone" label={formatMessage({ id: 'Phone' })} rule="REQ TEL" />}
          <Input.Password type="password" name="password" label={formatMessage({ id: 'Password' })} rule="REQ LEN-6-50" />
        </div>
      </Space>
      <Space className="space-full" size={10} direction="vertical">
        <SubmitButton block size="large">
          {formatMessage({ id: 'Login' })}
        </SubmitButton>
        <Row justify="space-between">
          <Col>
            <Checkbox
              checked={rememberUser}
              onChange={e => {
                setRememberUser(e.target.checked);
              }}>
              {formatMessage({ id: 'RememberAccount' })}
            </Checkbox>
          </Col>
          <Col>
            <Flex gap={8}>
              {registerUrl && (
                <Button
                  className={style['forget-button']}
                  type="link"
                  size="small"
                  onClick={() => {
                    navigate(registerUrl);
                  }}>
                  {formatMessage({ id: 'RegisterBtn' })}
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
                  {formatMessage({ id: 'ForgetPassword' })}
                </Button>
              )}
            </Flex>
          </Col>
        </Row>
      </Space>
    </Form>
  );
});

export default withLocale(LoginInner);
