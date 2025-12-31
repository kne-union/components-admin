import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const RetryTask = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:ConfirmButton']
})(withLocale(({ remoteModules, taskIds, data, onSuccess, ...props }) => {
  const [usePreset, ConfirmButton] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <ConfirmButton
      {...props}
      message={formatMessage({ id: 'ConfirmRetryTask' })}
      isDelete={false}
      onClick={async () => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.task.retry, {
            data: { id: data?.id, taskIds }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success(formatMessage({ id: 'TaskModifiedToPending' }));
        onSuccess && onSuccess();
      }}
    />
  );
}));

export default RetryTask;
