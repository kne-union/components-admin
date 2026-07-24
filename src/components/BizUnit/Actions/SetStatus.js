import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const SetStatus = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:ConfirmButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, onSuccess, apis, options, getFormInner, confirmMessage, confirm, isDelete, ...props }) => {
    const [LoadingButton, ConfirmButton, usePreset] = remoteModules;
    const { ajax } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const confirmText = confirmMessage || confirm;
    const CurrentButton = confirmText ? ConfirmButton : LoadingButton;
    const isOpenAction = data.status !== (options?.openStatus || 'open');
    return (
      <CurrentButton
        {...merge({}, props, isOpenAction ? options.openButtonProps : options.closeButtonProps)}
        message={confirmText}
        isDelete={false}
        onClick={async () => {
          const { data: resData } = await ajax(
            typeof apis.setStatus === 'function'
              ? apis.setStatus({ data, options })
              : merge({}, apis.setStatus, {
                  data: {
                    id: data.id,
                    status: isOpenAction ? options?.openStatus || 'open' : options?.closedStatus || 'closed'
                  }
                })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'ModifySuccess' }, { bizName: options.bizName }));
          onSuccess && onSuccess();
        }}
      />
    );
  })
);

export default SetStatus;
