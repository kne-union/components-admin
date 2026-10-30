import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import { buildExampleProps } from './utils';

const toVariableList = list =>
  (Array.isArray(list) ? list : [])
    .filter(item => item && item.name)
    .map(item =>
      Object.assign({ name: String(item.name).trim() }, item.label ? { label: item.label } : {}, item.example ? { example: item.example } : {})
    );

export const toTemplatePayload = (formData, { isEdit } = {}) =>
  Object.assign(
    {
      name: formData.name,
      code: formData.code,
      subject: Number(formData.type) === 1 ? '' : formData.subject || '',
      content: formData.content || '',
      description: formData.description || '',
      variables: toVariableList(formData.variables)
    },
    isEdit ? {} : { type: Number(formData.type) || 0 }
  );

export const toTemplateFormData = data => ({
  name: data.name,
  code: data.code,
  type: Number(data.type) || 0,
  subject: data.subject || '',
  content: data.content || '',
  description: data.description || '',
  variables: Array.isArray(data.variables) ? data.variables : []
});

const TemplateFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-thirdparty:TemplateEditor']
})(
  withLocale(({ remoteModules, action }) => {
    const [FormInfo, TemplateEditor] = remoteModules;
    const { Input, TextArea, RadioGroup } = FormInfo.fields;
    const { TableList } = FormInfo;
    const { formData } = FormInfo.useFormContext();
    const { formatMessage } = useIntl();
    const isEdit = action === 'edit';
    const isSms = Number(formData?.type) === 1;
    const variablesKey = JSON.stringify(toVariableList(formData?.variables));
    const { variables, previewData } = useMemo(() => {
      const list = JSON.parse(variablesKey);
      return { variables: list.map(item => ({ name: item.name, label: item.label || item.name })), previewData: buildExampleProps(list) };
    }, [variablesKey]);

    return (
      <>
        <FormInfo
          column={2}
          list={[
            <Input name="name" label={formatMessage({ id: 'TemplateName' })} rule="REQ LEN-1-100" />,
            <Input name="code" label={formatMessage({ id: 'TemplateCode' })} rule="REQ LEN-1-100" tips={formatMessage({ id: 'TemplateCodeTips' })} />,
            <RadioGroup
              name="type"
              label={formatMessage({ id: 'Type' })}
              rule="REQ"
              defaultValue={0}
              disabled={isEdit}
              options={[
                { label: formatMessage({ id: 'EmailChannel' }), value: 0 },
                { label: formatMessage({ id: 'SMS' }), value: 1 }
              ]}
            />,
            <TextArea name="description" label={formatMessage({ id: 'Description' })} autoSize={{ minRows: 1, maxRows: 3 }} />
          ]}
        />
        <TableList
          name="variables"
          title={formatMessage({ id: 'VariableList' })}
          column={3}
          list={[
            <Input name="name" label={formatMessage({ id: 'VariableName' })} rule="REQ LEN-1-100" tips={formatMessage({ id: 'VariableNameTips' })} />,
            <Input name="label" label={formatMessage({ id: 'VariableLabel' })} rule="LEN-0-50" />,
            <Input name="example" label={formatMessage({ id: 'VariableExample' })} rule="LEN-0-200" />
          ]}
        />
        <FormInfo
          column={1}
          list={[
            isSms ? null : (
              <Input
                name="subject"
                label={formatMessage({ id: 'Subject' })}
                rule="REQ LEN-0-500"
                block
                tips={formatMessage({ id: 'TemplateSubjectTips' })}
              />
            ),
            <TemplateEditor
              key={isSms ? 'text' : 'html'}
              name="content"
              label={formatMessage({ id: 'TemplateContent' })}
              rule="REQ"
              block
              type={isSms ? 'text' : 'html'}
              subject={isSms ? undefined : formData?.subject}
              variables={variables}
              previewData={previewData}
            />
          ].filter(Boolean)}
        />
      </>
    );
  })
);

export default TemplateFormInner;
