import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App } from 'antd';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';

const SetStatusInner = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, data, onSuccess, apis, ...props }) => {
  const [LoadingButton, ConfirmButton, usePreset] = remoteModules;
  const { formatMessage } = useIntl();
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
        message.success(formatMessage({ id: 'ModifySuccess' }));
        onSuccess && onSuccess();
      }}
    />
  );
});

export default withLocale(SetStatusInner);
