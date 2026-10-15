import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { MailEditorField } from '../MailEditor';
import { TemplateCategorySelectField } from '../fields';
import TemplatePreview, { VariableTips } from './TemplatePreview';

export const toTemplatePayload = formData => ({
  name: formData.name,
  categoryId: formData.categoryId || null,
  subject: formData.subject || '',
  html: formData.html || '',
  description: formData.description || ''
});

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { Input, TextArea } = FormInfo.fields;
    const { FormApiButton } = FormInfo;
    const { modal } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <>
        <FormInfo
          column={2}
          list={[
            <Input name="name" label={formatMessage({ id: 'TemplateName' })} rule="REQ LEN-1-100" />,
            <TemplateCategorySelectField name="categoryId" label={formatMessage({ id: 'TemplateCategory' })} />,
            <Input
              name="subject"
              label={formatMessage({ id: 'Subject' })}
              rule="LEN-0-500"
              block
              tips={formatMessage({ id: 'TemplateSubjectTips' })}
            />,
            <TextArea name="description" label={formatMessage({ id: 'Description' })} block autoSize={{ minRows: 1, maxRows: 3 }} />
          ]}
        />
        <VariableTips />
        <FormInfo column={1} list={[<MailEditorField name="html" label={formatMessage({ id: 'Content' })} rule="REQ" block />]} />
        <FormApiButton
          onClick={({ openApi }) => {
            const formData = openApi.getFormData();
            modal.info({
              title: formatMessage({ id: 'TemplatePreview' }),
              width: 760,
              content: <TemplatePreview template={formData} />
            });
          }}
        >
          {formatMessage({ id: 'TemplatePreview' })}
        </FormApiButton>
      </>
    );
  })
);

export default FormInner;
