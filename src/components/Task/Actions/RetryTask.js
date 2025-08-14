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
      message="确定要重试任务吗?"
      isDelete={false}
      onClick={async () => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.task.retry, {
            data: { id: data.id }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success('任务已修改为待执行');
        onSuccess && onSuccess();
      }}
    />
  );
});

export default CancelTask;
