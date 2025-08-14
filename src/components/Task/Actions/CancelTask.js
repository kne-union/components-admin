import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';

const CancelTask = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:ConfirmButton']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [usePreset, ConfirmButton] = remoteModules;
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <ConfirmButton
      {...props}
      message="确定要取消任务吗?"
      isDelete={false}
      onClick={async () => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.task.cancel, {
            data: { id: data.id }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success('取消任务成功');
        onSuccess && onSuccess();
      }}
    />
  );
});

export default CancelTask;
