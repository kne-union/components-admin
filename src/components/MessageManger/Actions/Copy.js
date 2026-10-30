import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const Copy = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, apis, onSuccess, options, getFormInner, fetchOptions, detailType, ...props }) => {
    const [LoadingButton, usePreset] = remoteModules;
    const { ajax, apis: presetApis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <LoadingButton
        {...props}
        onClick={async () => {
          const { data: resData } = await ajax(Object.assign({}, presetApis.messageManger.templates.copy, { urlParams: { id: data.id } }));
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'CopyTemplateSuccess' }));
          onSuccess && onSuccess();
        }}
      />
    );
  })
);

export default Copy;
