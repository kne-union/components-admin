import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';

const SetDefault = createWithRemoteLoader({
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
        message={formatMessage({ id: 'ConfirmSetDefault' }, { name: data?.name || data?.code })}
        onClick={async () => {
          const { data: resData } = await ajax(
            typeof apis.setDefault === 'function'
              ? apis.setDefault({ data, options })
              : merge({}, apis.setDefault, {
                  data: { id: data.id }
                })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'SetDefaultSuccess' }));
          onSuccess && onSuccess();
        }}
      >
        {formatMessage({ id: 'SetDefault' })}
      </ConfirmButton>
    );
  })
);

export default SetDefault;
