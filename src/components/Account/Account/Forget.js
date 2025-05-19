import LoginOuterContainer from '../LoginOuterContainer';
import ForgetByEmailComponent from '../ForgetByEmail';
import merge from 'lodash/merge';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useProps } from './context';

const Forget = createWithRemoteLoader({
  modules: ['component-core:Global@usePreset']
})(({ remoteModules }) => {
  const [usePreset] = remoteModules;
  const { apis: presetApis, ajax } = usePreset();
  const { apis, loginUrl } = useProps();
  const account = merge({}, presetApis.account, apis);
  return (
    <LoginOuterContainer>
      <ForgetByEmailComponent
        loginUrl={loginUrl}
        onSubmit={(formData, success) => {
          return ajax(
            merge({}, account.forgetPwd, {
              data: { email: formData.email }
            })
          ).then(({ data }) => {
            if (data.code === 0) {
              success && success(formData.email);
            }
          });
        }}
      />
    </LoginOuterContainer>
  );
});

export default Forget;
