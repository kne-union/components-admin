import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const RemoveInner = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [ConfirmButton, usePreset] = remoteModules;
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  return (
    <ConfirmButton
      {...props}
      onClick={async () => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.tenantAdmin.remove, {
            data: { id: data.id }
          })
        );

        if (resData.code !== 0) {
          return;
        }
        message.success(formatMessage({ id: 'RemoveTenantSuccess' }));
        onSuccess && onSuccess();
      }}
    />
  );
});

export default withLocale(RemoveInner);
