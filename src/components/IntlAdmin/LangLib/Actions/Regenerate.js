import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';

const Regenerate = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, onSuccess, apis, options, ...props }) => {
    const [ConfirmButton, usePreset] = remoteModules;
    const { ajax } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();

    return (
      <ConfirmButton
        {...props}
        type="link"
        message={formatMessage({ id: 'ConfirmRegenerate' })}
        onClick={async () => {
          const { data: resData } = await ajax(
            typeof apis.regenerate === 'function'
              ? apis.regenerate({ data, options })
              : merge({}, apis.regenerate, {
                  data: { id: data.id }
                })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'RegenerateSuccess' }));
          onSuccess && onSuccess();
        }}
      >
        {formatMessage({ id: 'AiRegenerate' })}
      </ConfirmButton>
    );
  })
);

export default Regenerate;
