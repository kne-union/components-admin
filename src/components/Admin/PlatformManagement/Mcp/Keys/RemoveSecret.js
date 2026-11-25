import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../../withLocale';

const RemoveSecret = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:ConfirmButton']
})(
  withLocale(({ remoteModules, data, removeApi, onSuccess, ...props }) => {
    const [usePreset, ConfirmButton] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();

    return (
      <ConfirmButton
        {...props}
        onClick={async () => {
          const { data: resData } = await ajax(
            Object.assign({}, removeApi || apis.mcp.keys.remove, {
              urlParams: { id: String(data.id) }
            })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'DeleteSuccess' }));
          onSuccess && onSuccess();
        }}
      />
    );
  })
);

export default RemoveSecret;
