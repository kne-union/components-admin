import ModifyComponent from '../Modify';
import { useParams, useSearchParams } from 'react-router-dom';
import { useProps } from './context';
import useNavigate from '@kne/use-refer-navigate';
import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import md5 from 'md5';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const ModifyInner = createWithRemoteLoader({
  modules: ['component-core:Global@usePreset']
})(({ remoteModules }) => {
  const [usePreset] = remoteModules;
  const { apis: presetApis, ajax } = usePreset();
  const { apis, loginUrl, accountType, loginLeftInner, systemName } = useProps();
  const { account: accountValue } = useParams();
  const [searchParams] = useSearchParams();
  const referer = searchParams.get('referer');
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  const account = Object.assign({}, presetApis.account, apis);
  return (
    <ModifyComponent
      type={accountType}
      account={accountValue}
      topBanner={loginLeftInner}
      systemName={systemName}
      onSubmit={async formData => {
        const newPwd = md5(formData.newPwd);
        const { data: resData } = await ajax(
          merge({}, account.modifyPassword, {
            data: {
              email: formData.email,
              oldPwd: md5(formData.oldPwd),
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
});

export default withLocale(ModifyInner);
