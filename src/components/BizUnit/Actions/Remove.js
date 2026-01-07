import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const Remove = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:ConfirmButton', 'components-core:Global@usePreset']
})(withLocale(({ remoteModules, data, onSuccess, apis, options, getFormInner, ...props }) => {
  const [LoadingButton, ConfirmButton, usePreset] = remoteModules;
  const { ajax } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  const CurrentButton = props.message || props.confirm ? ConfirmButton : LoadingButton;
  return (
    <CurrentButton
      {...Object.assign({}, props, options.removeButtonProps)}
      onClick={async () => {
        const { data: resData } = await ajax(
          typeof apis.remove === 'function'
            ? apis.remove({ data, options })
            : merge({}, apis.remove, {
                data: { id: data.id }
              })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success(formatMessage({ id: 'DeleteSuccess' }, { bizName: options.bizName }));
        onSuccess && onSuccess();
      }}
    />
  );
}));

export default Remove;
