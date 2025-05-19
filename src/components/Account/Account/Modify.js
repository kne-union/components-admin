import ModifyComponent from '../Modify';
import { useParams } from 'react-router-dom';
import { useProps } from './context';
import useNavigate from '@kne/use-refer-navigate';
import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import md5 from 'md5';
import { App } from 'antd';

const Modify = createWithRemoteLoader({
  modules: ['component-core:Global@usePreset']
})(({ remoteModules }) => {
  const [usePreset] = remoteModules;
  const { apis: presetApis, ajax } = usePreset();
  const { apis, loginUrl, accountType } = useProps();
  const { account: accountValue } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const account = Object.assign({}, presetApis.account, apis);
  return (
    <ModifyComponent
      type={accountType}
      account={accountValue}
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
        message.success('重置密码成功');
        navigate(loginUrl);
      }}
    />
  );
});

export default Modify;
