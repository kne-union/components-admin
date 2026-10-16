import { createWithRemoteLoader } from '@kne/remote-loader';
import { useCallback } from 'react';
import { App, Button } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import ComposeFormInner from './ComposeFormInner';
import { formatAddress, prefixSubject, quoteMail } from '../utils';
import { ContactsProvider, useGetContacts } from '../fields';

const toAddressValue = list => (list || []).map(formatAddress);

const splitAttachments = list => ({
  uploaded: (list || []).filter(item => item.id),
  pending: (list || []).filter(item => !item.id)
});

const toAttachment = ({ id, url, filename, originalName, contentType, size, mailId, index }) => ({
  id,
  url,
  filename: filename || originalName,
  contentType,
  size,
  mailId,
  index
});

const getComposeData = ({ mode, mail, accountId, accountAddress, formatMessage }) => {
  if (!mail) {
    return { form: { accountId }, extra: {} };
  }
  if (mode === 'draft') {
    const { uploaded, pending } = splitAttachments(mail.attachments);
    return {
      form: {
        accountId: mail.accountId,
        to: toAddressValue(mail.to),
        cc: toAddressValue(mail.cc),
        bcc: toAddressValue(mail.bcc),
        subject: mail.subject,
        html: mail.html,
        attachments: uploaded
      },
      extra: { inReplyTo: mail.inReplyTo, references: mail.references, attachments: pending }
    };
  }
  if (mode === 'forward') {
    const { uploaded, pending } = splitAttachments(
      (mail.attachments || []).map((item, index) => (item.id || item.url ? item : Object.assign({}, item, { mailId: mail.id, index })))
    );
    return {
      form: {
        accountId: mail.accountId,
        subject: prefixSubject('Fwd:', mail.subject),
        html: quoteMail(mail, { formatMessage }),
        attachments: uploaded
      },
      extra: { attachments: pending }
    };
  }
  const self = String(accountAddress || '').toLowerCase();
  const replyTo = mail.folder === 'sent' ? mail.to : mail.from;
  const others =
    mode === 'replyAll'
      ? [...(mail.to || []), ...(mail.cc || [])].filter(
          item => String(item.address).toLowerCase() !== self && !(replyTo || []).some(target => target.address === item.address)
        )
      : [];
  return {
    form: {
      accountId: mail.accountId,
      to: toAddressValue(replyTo),
      cc: toAddressValue(others),
      subject: prefixSubject('Re:', mail.subject),
      html: quoteMail(mail, { formatMessage })
    },
    extra: { inReplyTo: mail.messageId, references: mail.references }
  };
};

export const useOpenCompose = ({ FormInfo, usePreset, getContacts: getContactsProp }) => {
  const formModal = FormInfo.useFormModal();
  const contextGetContacts = useGetContacts();
  const getContacts = getContactsProp || contextGetContacts;
  const { FormApiButton, CancelButton, SubmitButton } = FormInfo;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();

  return useCallback(
    ({ mode = 'new', mail, accountId, accountAddress, onSuccess } = {}) => {
      const draftId = mode === 'draft' ? mail?.id : null;
      const { form, extra } = getComposeData({ mode, mail, accountId, accountAddress, formatMessage });
      const buildPayload = formData =>
        Object.assign({}, extra, formData, {
          attachments: [...(extra.attachments || []), ...(formData.attachments || [])].map(toAttachment)
        });
      const isQuote = Boolean(mail) && ['reply', 'replyAll', 'forward'].includes(mode);
      const titleId = { new: 'Compose', reply: 'Reply', replyAll: 'ReplyAll', forward: 'Forward', draft: 'EditDraft' }[mode] || 'Compose';

      const saveDraft = async ({ openApi }) => {
        const payload = buildPayload(openApi.getFormData());
        if (!payload.accountId) {
          message.warning(formatMessage({ id: 'SelectAccount' }));
          return false;
        }
        const api = draftId
          ? Object.assign({}, apis.mailGateway.draft.save, { urlParams: { id: draftId }, data: payload })
          : Object.assign({}, apis.mailGateway.draft.create, { data: payload });
        const { data: resData } = await ajax(api);
        if (resData.code !== 0) {
          return false;
        }
        message.success(formatMessage({ id: 'DraftSaved' }));
        onSuccess && onSuccess();
      };

      formModal({
        title: formatMessage({ id: titleId }),
        size: 'large',
        formProps: {
          data: form,
          onSubmit: async formData => {
            const payload = buildPayload(formData);
            const api = draftId
              ? Object.assign({}, apis.mailGateway.draft.send, { urlParams: { id: draftId }, data: payload })
              : Object.assign({}, apis.mailGateway.mail.send, { data: payload });
            const { data: resData } = await ajax(api);
            if (resData.code !== 0) {
              return false;
            }
            message.success(formatMessage({ id: 'MailSent' }));
            onSuccess && onSuccess();
          }
        },
        footerButtons: [
          { children: formatMessage({ id: 'Cancel' }), ButtonComponent: CancelButton },
          { children: formatMessage({ id: 'SaveDraft' }), ButtonComponent: FormApiButton, onClick: saveDraft },
          { type: 'primary', children: formatMessage({ id: 'Send' }), ButtonComponent: SubmitButton, autoClose: false }
        ],
        children: (
          <ContactsProvider getContacts={getContacts}>
            <ComposeFormInner mailId={isQuote ? mail.id : null} quoteHtml={isQuote ? form.html : ''} />
          </ContactsProvider>
        )
      });
    },
    [formModal, FormApiButton, CancelButton, SubmitButton, ajax, apis, message, formatMessage, getContacts]
  );
};

const Compose = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, mode, mail, accountId, accountAddress, getContacts, onSuccess, children, ...props }) => {
    const [FormInfo, usePreset] = remoteModules;
    const { formatMessage } = useIntl();
    const openCompose = useOpenCompose({ FormInfo, usePreset, getContacts });
    return (
      <Button {...props} onClick={() => openCompose({ mode, mail, accountId, accountAddress, onSuccess })}>
        {children || formatMessage({ id: 'Compose' })}
      </Button>
    );
  })
);

export default Compose;
