import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const DeadLetterReplay = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:ConfirmButton']
})(
  withLocale(({ remoteModules, data, ids, onSuccess, message: propsMessage, ...props }) => {
    const [usePreset, ConfirmButton] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const replayIds = ids || (data?.id ? [data.id] : []);

    if (data?.replayed) {
      return null;
    }

    return (
      <ConfirmButton
        {...props}
        disabled={props.disabled || replayIds.length === 0}
        isDelete={false}
        message={propsMessage || (replayIds.length > 1 ? formatMessage({ id: 'BatchReplayConfirm' }) : formatMessage({ id: 'ReplayMessageConfirm' }))}
        onClick={async () => {
          const { data: resData } = await ajax(
            Object.assign({}, apis.mq.deadLetter.replay, {
              data: replayIds.length > 1 ? { ids: replayIds } : { id: replayIds[0] }
            })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'ReplaySuccess' }));
          onSuccess && onSuccess();
        }}
      />
    );
  })
);

export default DeadLetterReplay;
