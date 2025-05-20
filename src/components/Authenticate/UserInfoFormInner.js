import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex } from 'antd';

const UserInfoFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, ...props }) => {
  const [FormInfo] = remoteModules;
  const { Avatar, Input, TextArea } = FormInfo.fields;
  return (
    <FormInfo
      {...props}
      list={[
        <Flex justify="center">
          <Avatar name="avatar" label="头像" labelHidden interceptor="photo-string" />
        </Flex>,
        <Input name="email" label="邮箱" rule="REQ" />,
        <Input name="nickname" label="昵称" />,
        <TextArea name="description" label="简介" rule="LEN-0-500" />
      ]}
    />
  );
});

export default UserInfoFormInner;
