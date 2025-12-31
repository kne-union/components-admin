import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const SetStatusInner = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, data, status, onSuccess, ...props }) => {
  const [ConfirmButton, usePreset] = remoteModules;
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
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
        message.success(formatMessage({ id: 'SetStatusSuccess' }));
        onSuccess && onSuccess();
      }}
    />
  );
});

export default withLocale(SetStatusInner);
