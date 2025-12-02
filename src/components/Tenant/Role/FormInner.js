import { createWithRemoteLoader } from '@kne/remote-loader';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, action, ...props }) => {
  const [FormInfo] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;
  return (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="角色名称" rule="REQ LEN-2-100" />,
        <Input name="code" label="角色编码" rule="REQ LEN-2-100" disabled={action === 'edit'} />,
        <TextArea name="description" label="角色描述" />
      ]}
    />
  );
});

export default FormInner;
