import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex } from 'antd';
import merge from 'lodash/merge';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, apis }) => {
  const [FormInfo] = remoteModules;
  const { Avatar, Input, PhoneNumber, TextArea, SuperSelectTree, SuperSelect } = FormInfo.fields;
  return (
    <FormInfo
      column={1}
      list={[
        <Flex justify="center">
          <Avatar name="avatar" label="头像" labelHidden interceptor="photo-string" />
        </Flex>,
        <Input name="name" label="姓名" rule="REQ LEN-0-100" />,
        <SuperSelectTree name="tenantOrgId" label="部门" api={apis.orgList} valueKey="id" labelKey="name" single interceptor="object-output-value" />,
        <SuperSelect
          name="roles"
          label="角色"
          api={merge({}, apis.roleList, {
            params: {
              filter: { status: 'open' }
            },
            transformData: data => {
              return Object.assign({}, data, {
                pageData: data.pageData.filter(item => !(item.type === 'system' && item.code === 'default'))
              });
            }
          })}
          valueKey="id"
          labelKey="name"
          interceptor="array-output-value"
        />,
        <PhoneNumber name="phone" label="手机" format="string" />,
        <Input name="email" label="邮箱" rule="EMAIL LEN-0-100" />,
        <TextArea name="description" label="描述" block />
      ]}
    />
  );
});

export default FormInner;
