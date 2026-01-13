import { createWithRemoteLoader } from '@kne/remote-loader';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, ...props }) => {
  const [FormInfo] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;
  return (
    <FormInfo
      column={1}
      {...props}
      list={[
        <Input name="name" label="名称" rule="REQ LEN-0-100" />,
        <Input name="code" label="编码" rule="REQ LEN-0-100" />,
        <TextArea name="params" label="翻译参数" rule="LEN-0-1000" />,
        <TextArea name="description" label="描述" rule="LEN-0-1000" />
      ]}
    />
  );
});

export default FormInner;
