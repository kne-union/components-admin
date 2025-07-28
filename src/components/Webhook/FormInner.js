import { createWithRemoteLoader } from '@kne/remote-loader';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { useFormContext } = FormInfo;
  const { Input, DatePicker, Switch } = FormInfo.fields;
  const { formData } = useFormContext();
  return (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="名称" description="需说明调用webhook的端口的身份" rule="REQ LEN-0-20" />,
        <Input name="signatureLocation" label="签名所在位置" rule="REQ LEN-0-100" defaultValue="headers['x-signature']" />,
        <Input name="inputLocation" label="输入参数位置" rule="REQ LEN-0-100" defaultValue="body" />,
        <Switch name="shouldEncryptVerify" label="body内容签名验证完整性" display={formData.inputLocation === 'body'} />,
        <DatePicker name="expire" label="过期时间" showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
      ]}
    />
  );
});

export default FormInner;
