import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App } from 'antd';

const Remove = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, data, onSuccess, apis, options, getFormInner, ...props }) => {
  const [LoadingButton, ConfirmButton, usePreset] = remoteModules;
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const CurrentButton = props.message || props.confirm ? ConfirmButton : LoadingButton;
  return (
    <CurrentButton
      {...Object.assign({}, props, options.removeButtonProps)}
      onClick={async () => {
        const { data: resData } = await ajax(
          typeof apis.remove === 'function'
            ? apis.remove({ data, options })
            : merge({}, apis.remove, {
                data: { id: data.id }
              })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success(`删除${options.bizName}成功`);
        onSuccess && onSuccess();
      }}
    />
  );
});

export default Remove;
