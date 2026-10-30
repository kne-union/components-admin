import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { getTemplateVariables, TemplateTextInput } from '../MailEditor';
import { createField, TemplateCategorySelectField } from '../fields';
import { SAMPLE_CONTEXT } from './TemplatePreview';

const TemplateTextField = createField(TemplateTextInput);

export const toTemplatePayload = formData => ({
  name: formData.name,
  categoryId: formData.categoryId || null,
  subject: formData.subject || '',
  html: formData.html || '',
  description: formData.description || ''
});

/**
 * 模版表单：主题与正文均为 Liquid 模版，可插入 mail / account 变量与条件；正文编辑器内置按示例数据预览
 */
const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset', 'components-thirdparty:TemplateEditor']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo, usePreset, TemplateEditor] = remoteModules;
    const { Input, TextArea } = FormInfo.fields;
    const { formData } = FormInfo.useFormContext();
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const variables = useMemo(() => getTemplateVariables(formatMessage), [formatMessage]);
    const uploadAdapter = useMemo(() => ({ upload: apis?.file?.uploadForEditor }), [apis?.file?.uploadForEditor]);
    return (
      <FormInfo
        column={2}
        list={[
          <Input name="name" label={formatMessage({ id: 'TemplateName' })} rule="REQ LEN-1-100" />,
          <TemplateCategorySelectField name="categoryId" label={formatMessage({ id: 'TemplateCategory' })} />,
          <TemplateTextField name="subject" label={formatMessage({ id: 'Subject' })} rule="LEN-0-500" block tips={formatMessage({ id: 'TemplateSubjectTips' })} />,
          <TextArea name="description" label={formatMessage({ id: 'Description' })} block autoSize={{ minRows: 1, maxRows: 3 }} />,
          <TemplateEditor
            name="html"
            label={formatMessage({ id: 'Content' })}
            rule="REQ"
            block
            type="html"
            subject={formData?.subject || ''}
            variables={variables}
            previewData={SAMPLE_CONTEXT}
            uploadAdapter={uploadAdapter}
          />
        ]}
      />
    );
  })
);

export default FormInner;
