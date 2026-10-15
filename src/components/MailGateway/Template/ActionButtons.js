import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import TemplatePreview from './TemplatePreview';

export const isSystemLevel = data => Number(data?.level) === 0;

// 系统默认的分类 / 模版由服务端启动时载入并覆盖，界面上不提供编辑和删除
export const getSystemLockedActions = data =>
  ['save', 'remove'].map(name => ({ name, reset: ({ hidden }) => ({ name, hidden: hidden || isSystemLevel(data) }) }));

export const PreviewTemplateButton = withLocale(({ data, apis, onSuccess, options, getFormInner, fetchOptions, ...props }) => {
  const { modal } = App.useApp();
  const { formatMessage } = useIntl();
  return (
    <Button
      {...props}
      onClick={() => {
        modal.info({
          title: `${formatMessage({ id: 'TemplatePreview' })} - ${data.name}`,
          width: 760,
          content: <TemplatePreview template={data} />
        });
      }}
    />
  );
});

export const CopyTemplateButton = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, apis, onSuccess, options, getFormInner, fetchOptions, ...props }) => {
    const [LoadingButton, usePreset] = remoteModules;
    const { ajax, apis: presetApis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <LoadingButton
        {...props}
        onClick={async () => {
          const { data: resData } = await ajax(Object.assign({}, presetApis.mailGateway.template.copy, { urlParams: { id: data.id } }));
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
