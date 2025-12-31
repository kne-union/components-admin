import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createWithFetch } from '@kne/react-fetch';
import { createWithRemoteLoader } from '@kne/remote-loader';
import ResetPasswordComponent from '../ResetPassword';
import { useProps } from './context';
import { App } from 'antd';
import merge from 'lodash/merge';
import md5 from 'md5';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const NavigateToLogin = () => {
  const { loginUrl } = useProps();
  return <Navigate to={loginUrl} />;
};

const AccountFormToken = createWithFetch({
  error: () => <NavigateToLogin />
})(({ data, children }) => {
  return children(data);
});

const ResetPasswordInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [usePreset] = remoteModules;
  const { apis: presetApis, ajax } = usePreset();
  const { apis, accountType, loginUrl, loginLeftInner, systemName } = useProps();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referer = searchParams.get('referer');
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  const account = Object.assign({}, presetApis.account, apis);
  const { token } = useParams();
  return (
    <AccountFormToken
      {...merge({}, account.parseResetToken, {
        data: {
          token: decodeURIComponent(token)
        }
      })}>
      {({ name }) => {
        return (
          <ResetPasswordComponent
            loginUrl={loginUrl}
            type={accountType}
            account={name}
            topBanner={loginLeftInner}
            systemName={systemName}
            onSubmit={async formData => {
              const newPwd = md5(formData.newPwd);
              const { data: resData } = await ajax(
                merge({}, account.resetPassword, {
                  data: {
                    token,
                    email: formData.email,
                    newPwd: newPwd,
                    confirmPwd: newPwd
                  }
                })
              );
              if (resData.code !== 0) {
                return;
              }
              message.success(formatMessage({ id: 'ResetPasswordSuccess' }));
              navigate(`${loginUrl}${referer ? `?referer=${encodeURIComponent(referer)}` : ''}`);
            }}
          />
        );
      }}
    </AccountFormToken>
  );
});

export default withLocale(ResetPasswordInner);
