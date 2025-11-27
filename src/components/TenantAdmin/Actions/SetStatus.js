import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';

const SetStatus = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, data, status, onSuccess, ...props }) => {
  const [ConfirmButton, usePreset] = remoteModules;
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <ConfirmButton
      {...props}
      onClick={async () => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.tenantAdmin.setStatus, {
            data: { id: data.id, status }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success('设置成功');
        onSuccess && onSuccess();
      }}
    />
  );
});

export default SetStatus;
