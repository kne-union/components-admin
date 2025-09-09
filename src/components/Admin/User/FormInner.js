import { createWithRemoteLoader } from '@kne/remote-loader';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:FormInfo@formModule']
})(({ remoteModules }) => {
  const [FormInfo, formModule] = remoteModules;
  const { Input, TextArea, PhoneNumber, Avatar } = formModule;
  return (
    <FormInfo
      column={1}
      list={[
        <Avatar name="avatar" label="头像" labelHidden interceptor="photo-string" />,
        <Input name="nickname" label="昵称" rule="LEN-0-100" />,
        <Input name="email" label="邮箱" rule="EMAIL ACCOUNT_IS_EXISTS" realtime />,
        <PhoneNumber name="phone" label="手机" rule="ACCOUNT_IS_EXISTS" format="string" />,
        <TextArea name="description" label="个人简介" />
      ]}
    />
  );
});

export default FormInner;
