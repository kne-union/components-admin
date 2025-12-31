import RegisterComponent from '../Register';
import { useProps } from './context';
import useNavigate from '@kne/use-refer-navigate';
import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import md5 from 'md5';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const RegisterInner = createWithRemoteLoader({
  modules: ['component-core:Global@usePreset']
})(({ remoteModules }) => {
  const [usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis: presetApis, ajax } = usePreset();
  const { apis, accountType, loginUrl, registerTitle, loginLeftInner, systemName } = useProps();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const account = Object.assign({}, presetApis.account, apis);

  return (
    <RegisterComponent
      type={accountType}
      loginUrl={loginUrl}
      title={registerTitle}
      systemName={systemName}
      validateCode={async data => {
        const { data: resData } = await ajax(
          merge({}, account.validateCode, {
            data
          })
        );
        if (resData.code !== 0) {
          return { result: false, errMsg: resData.msg || formatMessage({ id: 'CodeValidateIncorrect' }, { s: '%s' }) };
        }

        return { result: true };
      }}
      topBanner={loginLeftInner}
      sendVerificationCode={async ({ type, data }) => {
        const { data: resData } = await ajax(
          merge({}, type === 'phone' ? account.sendSMSCode : account.sendEmailCode, {
            data: { [type]: data }
          })
        );
        if (resData.code !== 0) {
          return false;
        }
        message.success(formatMessage({ id: 'SendCodeSuccess' }, { s: type === 'phone' ? formatMessage({ id: 'PhoneCode' }) : formatMessage({ id: 'Email' }) }));
      }}
      onSubmit={async formData => {
        const newPwd = md5(formData.password);
        const { data: resData } = await ajax(
          merge({}, account.register, {
            data: {
              type: accountType,
              email: formData.email,
              phone: formData.phone,
              password: newPwd,
              code: formData.code
            }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success(formatMessage({ id: 'RegisterSuccess' }));
        navigate(loginUrl);
      }}
    />
  );
});

export default withLocale(RegisterInner);
