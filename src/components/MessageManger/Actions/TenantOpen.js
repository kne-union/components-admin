import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

// 切换系统模版是否开放给租户端定制，仅 tenantCustomizable 的模版可用
const TenantOpen = createWithRemoteLoader({
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
          const { data: resData } = await ajax(
            Object.assign({}, presetApis.messageManger.templates.setTenantOpen, {
              urlParams: { id: data.id },
              data: { tenantOpen: data.tenantOpen === false }
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
  })
);

export default TenantOpen;
