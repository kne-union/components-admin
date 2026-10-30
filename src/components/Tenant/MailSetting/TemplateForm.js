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

/** 租户只改主题、正文与说明；编码、类型、变量沿用系统模版 */
const TemplateForm = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-thirdparty:TemplateEditor']
})(
  withLocale(({ remoteModules, template }) => {
    const [FormInfo, TemplateEditor] = remoteModules;
    const { Input, TextArea } = FormInfo.fields;
    const { formData } = FormInfo.useFormContext();
    const { formatMessage } = useIntl();
    const { variables, previewData } = useMemo(() => {
      const list = getTemplateVariables(template);
      return { variables: list.map(item => ({ name: item.name, label: item.label || item.name })), previewData: buildExampleProps(list) };
    }, [template]);

    return (
      <FormInfo
        column={1}
        list={[
          <Input name="subject" label={formatMessage({ id: 'Subject' })} rule="REQ LEN-0-500" block tips={formatMessage({ id: 'SubjectTips' })} />,
          <TemplateEditor
            name="content"
            label={formatMessage({ id: 'TemplateContent' })}
            rule="REQ"
            block
            type="html"
            subject={formData?.subject}
            variables={variables}
            previewData={previewData}
          />,
          <TextArea name="description" label={formatMessage({ id: 'Description' })} autoSize={{ minRows: 1, maxRows: 3 }} block />
        ]}
      />
    );
  })
);

export default TemplateForm;
