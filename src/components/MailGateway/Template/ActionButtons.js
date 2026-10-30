import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import TemplatePreview from './TemplatePreview';

export const isSystemLevel = data => Number(data?.level) === 0;

// 系统默认的分类 / 模版由服务端启动时载入并覆盖，界面上不提供编辑和删除
export const getSystemLockedActions = data =>
  ['save', 'remove'].map(name => ({ name, reset: ({ hidden }) => ({ name, hidden: hidden || isSystemLevel(data) }) }));

/** 打开模版预览弹窗（列表「预览」按钮与点击模版名称共用） */
export const openTemplatePreview = ({ modal, formatMessage, template }) => {
  if (!template) {
    return;
  }
  modal({
    title: `${formatMessage({ id: 'TemplatePreview' })} - ${template.name}`,
    size: 'large',
    bodyScroll: false,
    footer: null,
    children: <TemplatePreview template={template} />
  });
};

export const PreviewTemplateButton = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, data, apis, onSuccess, options, getFormInner, fetchOptions, ...props }) => {
    const [useModal] = remoteModules;
    const modal = useModal();
    const { formatMessage } = useIntl();
    return (
      <Button
        {...props}
        onClick={() => {
          openTemplatePreview({ modal, formatMessage, template: data });
        }}
      />
    );
  })
);

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
