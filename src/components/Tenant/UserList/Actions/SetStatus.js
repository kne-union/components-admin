import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App } from 'antd';

const SetStatus = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, data, onSuccess, apis, ...props }) => {
  const [LoadingButton, ConfirmButton, usePreset] = remoteModules;
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const CurrentButton = props.message || props.confirm ? ConfirmButton : LoadingButton;
  return (
    <CurrentButton
      {...props}
      onClick={async () => {
        const { data: resData } = await ajax(
          merge({}, apis.setStatus, {
            data: { id: data.id, status: data.status === 'open' ? 'closed' : 'open' }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success('修改成功');
        onSuccess && onSuccess();
      }}
    />
  );
});

export default SetStatus;
