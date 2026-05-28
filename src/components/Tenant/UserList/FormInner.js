import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { Flex } from 'antd';
import get from 'lodash/get';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';
import getRoleListApi from '../Role/getRoleListApi';

const FormInnerInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(({ remoteModules, apis }) => {
  const [FormInfo, usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const { plugins } = usePreset();
  const { Avatar, Input, PhoneNumber, TextArea, SuperSelectTree, SuperSelect } = FormInfo.fields;
  const getFormInner = useRefCallback(() => {
    const formInner = [
      <Flex justify="center">
        <Avatar name="avatar" label={formatMessage({ id: 'Avatar' })} labelHidden interceptor="photo-string" />
      </Flex>,
      <Input name="name" label={formatMessage({ id: 'UserName' })} rule="REQ LEN-0-100" />,
      <SuperSelectTree
        name="tenantOrgIds"
        label={formatMessage({ id: 'Departments' })}
        api={apis.orgList}
        valueKey="id"
        labelKey="name"
        interceptor="array-output-value"
      />,
      <SuperSelect
        name="roles"
        label={formatMessage({ id: 'UserRole' })}
        api={getRoleListApi(apis)}
        valueKey="id"
        labelKey="name"
        interceptor="array-output-value"
      />,
      <PhoneNumber name="phone" label={formatMessage({ id: 'Phone' })} format="string" />,
      <Input name="email" label={formatMessage({ id: 'Email' })} rule="EMAIL LEN-0-100" />,
      <TextArea name="description" label={formatMessage({ id: 'UserDescription' })} block />
    ];
    const UserFormInner = get(plugins, 'tenantAdmin.UserFormInner');
    if (UserFormInner && (UserFormInner.$$typeof || typeof UserFormInner.type === 'function')) {
      return <UserFormInner column={1} list={formInner} apis={apis}/>;
    }

    return <FormInfo column={1} list={formInner} />;
  });

  return useMemo(() => {
    return getFormInner();
  }, [getFormInner]);
});

export default withLocale(FormInnerInner);
