import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import SendMessageForm from '../SendMessageForm';
import { buildMessageProps, getInvalidRecipients, getRequiredVariableNames, getTemplateVariables, parseRecipients } from '../utils';

/**
 * 发送 / 重新发送共用的弹窗配置：多收件人逐个发送，左侧填写右侧预览
 */
export const createSendModalOptions = ({ template, title, data, apis, ajax, message, formatMessage, onDone }) => {
  const variables = getTemplateVariables(template);
  const requiredNames = getRequiredVariableNames(template);
  const isSMS = Number(template.type) === 1;
  return {
    title,
    width: 1100,
    bodyScroll: false,
    footerButtons: [
      { buttonType: 'CancelButton', children: formatMessage({ id: 'Cancel' }) },
      { buttonType: 'SubmitButton', type: 'primary', children: formatMessage({ id: 'Send' }) }
    ],
    formProps: {
      data: Object.assign({ props: '{}' }, data),
      onSubmit: async formData => {
        let messageProps;
        try {
          messageProps = buildMessageProps(formData, variables);
        } catch {
          message.error(formatMessage({ id: 'PropsInvalid' }));
          return false;
        }
        const recipients = parseRecipients(formData.recipients);
        // MultiField 新增项的校验结果不一定阻止提交，这里再兜底校验一次
        if (recipients.length === 0) {
          message.error(formatMessage({ id: 'RecipientsRequired' }));
          return false;
        }
        const invalid = getInvalidRecipients(recipients, isSMS);
        if (invalid.length > 0) {
          message.error(formatMessage({ id: isSMS ? 'PhoneInvalid' : 'EmailInvalid' }, { list: invalid.join('、') }));
          return false;
        }
        const results = [];
        // 逐个发送：每个收件人一条发送记录，便于单独查看与重发
        for (const name of recipients) {
          const { data: resData } = await ajax(
            Object.assign({}, apis.messageManger.templates.send, { data: { templateId: String(template.id), name, props: messageProps } })
          );
          results.push({ requested: resData?.code === 0, success: resData?.code === 0 && resData.data?.success !== false });
        }
        if (!results.some(item => item.requested)) {
          return false;
        }
        const successCount = results.filter(item => item.success).length;
        if (successCount === results.length) {
          message.success(formatMessage({ id: 'SendResultSuccess' }, { count: successCount }));
        } else {
          message.warning(formatMessage({ id: 'SendResultPartial' }, { success: successCount, failed: results.length - successCount }));
        }
        onDone && onDone();
      }
    },
    children: <SendMessageForm template={template} variables={variables} requiredNames={requiredNames} />
  };
};

const SendMessageInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, data, detailType, onSuccess, ...props }) => {
  const [usePreset, useFormModal] = remoteModules;
  const { apis, ajax } = usePreset();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const formModal = useFormModal();
  const navigate = useNavigate();

  return (
    <Button
      {...props}
      onClick={() => {
        formModal(
          createSendModalOptions({
            template: data,
            title: `${formatMessage({ id: 'SendMessage' })} - ${data.name || data.code}`,
            apis,
            ajax,
            message,
            formatMessage,
            onDone: () => {
              if (detailType === 'template') {
                navigate('../records');
              } else {
                onSuccess && onSuccess();
              }
            }
          })
        );
      }}
    />
  );
});

const SendMessage = withLocale(SendMessageInner);
export default SendMessage;
