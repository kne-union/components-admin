import { createWithRemoteLoader } from '@kne/remote-loader';
import { FileImageOutlined } from '@ant-design/icons';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Input, InputNumber, TextArea, ColorPicker, Avatar, DateRangePicker } = FormInfo.fields;
  return (
    <>
      <FormInfo
        column={1}
        list={[
          <Input name="name" label="租户名称" rule="REQ LEN-0-100" />,
          <InputNumber name="accountCount" label="开通账号数量" defaultValue={10} min={1} precision={0} rule="REQ" />,
          <DateRangePicker name="serviceTime" label="服务时间" rule="REQ" />,
          <Avatar name="logo" label="Logo" block shape="square" width={162} height={48} rule="REQ" interceptor="photo-string" defaultAvatar={<FileImageOutlined />} />,
          <ColorPicker name="themeColor" label="主题色" format="hex" rule="REQ" defaultValue="#4183F0" disabledAlpha disabledFormat />,
          <TextArea name="description" label="描述" block />
        ]}
      />
    </>
  );
});

export default FormInner;
