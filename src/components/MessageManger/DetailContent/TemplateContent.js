import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { buildExampleProps, getTemplateVariables } from '../utils';

const TemplateContent = createWithRemoteLoader({
  modules: ['components-thirdparty:TemplateEditor']
})(({ remoteModules, data }) => {
  const [TemplateEditor] = remoteModules;
  const isSms = Number(data?.type) === 1;
  const { variables, previewData } = useMemo(() => {
    const list = getTemplateVariables(data);
    return { variables: list.map(item => ({ name: item.name, label: item.label || item.name })), previewData: buildExampleProps(list) };
  }, [data]);

  return (
    <TemplateEditor.Field
      readOnly
      copyable
      type={isSms ? 'text' : 'html'}
      value={data?.content || ''}
      subject={isSms ? undefined : data?.subject}
      variables={variables}
      previewData={previewData}
      height={isSms ? 120 : 320}
    />
  );
});

export default TemplateContent;
