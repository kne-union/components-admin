import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { App, Button } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import { getTemplateVariables, splitMessageProps } from '../utils';
import { createSendModalOptions } from './SendMessage';

/**
 * 重新发送：按记录的模板打开发送弹窗，用原收件人与参数预填，可修改后发送
 */
const ResendInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, data, detailType, onSuccess, ...props }) => {
  const [usePreset, useFormModal] = remoteModules;
  const { apis, ajax } = usePreset();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const formModal = useFormModal();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      {...props}
      loading={loading}
      onClick={async () => {
        setLoading(true);
        const { data: resData } = await ajax(
          Object.assign({}, apis.messageManger.templates.detail, { urlParams: { id: data.templateId } })
        ).finally(() => setLoading(false));
        const template = resData?.code === 0 ? resData.data : null;
        if (!template) {
          message.error(formatMessage({ id: 'TemplateNotFound' }));
          return;
        }
        const { fields, restProps } = splitMessageProps(getTemplateVariables(template), data.props || {});
        formModal(
          createSendModalOptions({
            template,
            title: `${formatMessage({ id: 'Resend' })} - ${template.name || template.code}`,
            data: Object.assign({ recipients: data.name ? [data.name] : [], props: JSON.stringify(restProps, null, 2) }, fields),
            apis,
            ajax,
            message,
            formatMessage,
            onDone: onSuccess
          })
        );
      }}
    />
  );
});

const Resend = withLocale(ResendInner);
export default Resend;
