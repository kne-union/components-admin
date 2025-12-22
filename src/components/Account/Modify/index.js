import commonStyle from '../style.module.scss';
import classnames from 'classnames';
import { Space } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';

const Modify = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, ...p }) => {
  const { className, title, systemName, isReset, account, onSubmit, type, header, topBanner } = Object.assign(
    {},
    {
      title: '修改密码',
      type: 'email',
      header: null
    },
    p
  );
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton, fields } = FormInfo;
  const { Input } = fields;

  return (
    <div className={classnames(commonStyle['out-container'], className)}>
      {topBanner && (
        <div className={commonStyle['top-banner']}>
          <div className={commonStyle['top-banner-inner']}>{systemName}</div>
          {topBanner}
        </div>
      )}
      <div className={commonStyle['out-inner']}>
        {header}
        <Form type="inner" size="large" onSubmit={onSubmit}>
          <Space className={classnames(commonStyle['form-inner'])} size={38} direction="vertical">
            <div className={commonStyle['title']}>{title}</div>
            <div>
              {type === 'email' && <Input name="email" label="邮箱账号" disabled defaultValue={account && decodeURIComponent(account)} />}
              {type === 'phone' && <Input name="phone" label="手机账号" disabled defaultValue={account && decodeURIComponent(account)} />}
              {isReset ? null : <Input.Password name="oldPwd" label="原密码" rule="REQ LEN-6-50" />}
              <Input.Password name="newPwd" label="新密码" rule="REQ LEN-6-50" />
              <Input.Password name="repeatNewPwd" label="重复密码" rule="REQ LEN-6-50 REPEAT-newPwd" />
            </div>
            <SubmitButton block size="large">
              提交
            </SubmitButton>
          </Space>
        </Form>
      </div>
    </div>
  );
});

export default Modify;
