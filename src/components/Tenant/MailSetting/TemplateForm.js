import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import { buildExampleProps, getTemplateVariables } from '@components/MessageManger/utils';

export const toTemplateFormData = template => ({
  subject: template?.subject || '',
  content: template?.content || '',
  description: template?.description || ''
});

/** 租户只改主题、正文与说明（短信无主题）；编码、类型、变量沿用系统模版 */
const TemplateForm = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-thirdparty:TemplateEditor']
})(
  withLocale(({ remoteModules, template }) => {
    const [FormInfo, TemplateEditor] = remoteModules;
    const { TextArea } = FormInfo.fields;
    const { formData } = FormInfo.useFormContext();
    const { formatMessage } = useIntl();
    const isSms = Number(template?.type) === 1;
    const { variables, previewData } = useMemo(() => {
      const list = getTemplateVariables(template);
      return { variables: list.map(item => ({ name: item.name, label: item.label || item.name })), previewData: buildExampleProps(list) };
    }, [template]);

    return (
      <FormInfo
        column={1}
        list={[
          isSms ? null : (
            <TemplateEditor
              key="subject"
              name="subject"
              label={formatMessage({ id: 'Subject' })}
              rule="REQ LEN-0-500"
              block
              type="text"
              height={80}
              variables={variables}
              previewData={previewData}
            />
          ),
          <TemplateEditor
            name="content"
            label={formatMessage({ id: isSms ? 'SmsContent' : 'TemplateContent' })}
            rule="REQ"
            block
            type={isSms ? 'text' : 'html'}
            subject={isSms ? undefined : formData?.subject}
            variables={variables}
            previewData={previewData}
          />,
          <TextArea name="description" label={formatMessage({ id: 'Description' })} autoSize={{ minRows: 1, maxRows: 3 }} block />
        ].filter(Boolean)}
      />
    );
  })
);

export default TemplateForm;
