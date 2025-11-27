import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex } from 'antd';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, apis }) => {
  const [FormInfo] = remoteModules;
  const { Avatar, Input, PhoneNumber, TextArea, SuperSelectTree } = FormInfo.fields;
  return (
    <FormInfo
      column={1}
      list={[
        <Flex justify="center">
          <Avatar name="avatar" label="头像" labelHidden interceptor="photo-string" />
        </Flex>,
        <Input name="name" label="姓名" rule="REQ LEN-0-100" />,
        <SuperSelectTree name="tenantOrgId" label="部门" api={apis.orgList} valueKey="id" labelKey="name" single interceptor="object-output-value" />,
        <PhoneNumber name="phone" label="手机" format="string" />,
        <Input name="email" label="邮箱" rule="EMAIL LEN-0-100" />,
        <TextArea name="description" label="描述" block />
      ]}
    />
  );
});

export default FormInner;
