import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const SetStatus = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:ConfirmButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, onSuccess, apis, options, getFormInner, ...props }) => {
    const [LoadingButton, ConfirmButton, usePreset] = remoteModules;
    const { ajax } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const CurrentButton = props.message || props.confirm ? ConfirmButton : LoadingButton;
    return (
      <CurrentButton
        {...merge({}, props, data.status === 'open' ? options.closeButtonProps : options.openButtonProps)}
        onClick={async () => {
          const { data: resData } = await ajax(
            typeof apis.setStatus === 'function'
              ? apis.setStatus({ data, options })
              : merge({}, apis.setStatus, {
                  data: { id: data.id, status: data.status === 'open' ? 'closed' : 'open' }
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
