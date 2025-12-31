import commonStyle from '../style.module.scss';
import classnames from 'classnames';
import { Space } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const ModifyInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, ...p }) => {
  const { formatMessage } = useIntl();
  const { className, title, systemName, isReset, account, onSubmit, type, header, topBanner } = Object.assign(
    {},
    {
      title: formatMessage({ id: 'Modify' }),
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
              {type === 'email' && <Input name="email" label={formatMessage({ id: 'EmailAccount' })} disabled defaultValue={account && decodeURIComponent(account)} />}
              {type === 'phone' && <Input name="phone" label={formatMessage({ id: 'PhoneAccount' })} disabled defaultValue={account && decodeURIComponent(account)} />}
              {isReset ? null : <Input.Password name="oldPwd" label={formatMessage({ id: 'OldPassword' })} rule="REQ LEN-6-50" />}
              <Input.Password name="newPwd" label={formatMessage({ id: 'NewPassword' })} rule="REQ LEN-6-50" />
              <Input.Password name="repeatNewPwd" label={formatMessage({ id: 'RepeatNewPassword' })} rule="REQ LEN-6-50 REPEAT-newPwd" />
            </div>
            <SubmitButton block size="large">
              {formatMessage({ id: 'Submit' })}
            </SubmitButton>
          </Space>
        </Form>
      </div>
    </div>
  );
});

export default withLocale(ModifyInner);
