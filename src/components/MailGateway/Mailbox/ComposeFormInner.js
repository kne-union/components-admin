import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { MailEditorField } from '../MailEditor';
import { AccountSelectField, ContactSelectField } from '../fields';
import ComposeTemplateField from './ComposeTemplate';

const ComposeFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules, mailId, quoteHtml }) => {
    const [FormInfo] = remoteModules;
    const { Input, Upload } = FormInfo.fields;
    const { formatMessage } = useIntl();
    const [editorKey, setEditorKey] = useState(0);
    return (
      <FormInfo
        column={1}
        list={[
          <ComposeTemplateField
            name="__templateId"
            label={formatMessage({ id: 'UseTemplate' })}
            tips={formatMessage({ id: 'UseTemplateTips' })}
            mailId={mailId}
            quoteHtml={quoteHtml}
            onApply={() => setEditorKey(key => key + 1)}
          />,
          <AccountSelectField name="accountId" label={formatMessage({ id: 'FromAccount' })} rule="REQ" onlyEnabled />,
          <ContactSelectField name="to" label={formatMessage({ id: 'To' })} rule="REQ" placeholder={formatMessage({ id: 'AddressPlaceholder' })} />,
          <ContactSelectField name="cc" label={formatMessage({ id: 'Cc' })} placeholder={formatMessage({ id: 'AddressPlaceholder' })} />,
          <ContactSelectField name="bcc" label={formatMessage({ id: 'Bcc' })} placeholder={formatMessage({ id: 'AddressPlaceholder' })} />,
          <Input name="subject" label={formatMessage({ id: 'Subject' })} rule="LEN-0-200" />,
          <MailEditorField key={editorKey} name="html" label={formatMessage({ id: 'Content' })} template={false} block />,
          <Upload name="attachments" label={formatMessage({ id: 'Attachment' })} block />
        ]}
      />
    );
  })
);

export default ComposeFormInner;
