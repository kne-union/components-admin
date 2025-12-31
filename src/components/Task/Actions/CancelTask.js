import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const CancelTaskInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:ConfirmButton']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [usePreset, ConfirmButton] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <ConfirmButton
      {...props}
      message={formatMessage({ id: 'ConfirmCancelTask' })}
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
        message.success(formatMessage({ id: 'CancelTaskSuccess' }));
        onSuccess && onSuccess();
      }}
    />
  );
});

const CancelTask = withLocale(CancelTaskInner);
export default CancelTask;
