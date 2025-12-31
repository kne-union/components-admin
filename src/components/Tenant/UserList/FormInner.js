import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { Flex } from 'antd';
import merge from 'lodash/merge';
import get from 'lodash/get';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';

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
        name="tenantOrgId"
        label={formatMessage({ id: 'Department' })}
        api={apis.orgList}
        valueKey="id"
        labelKey="name"
        single
        interceptor="object-output-value"
      />,
      <SuperSelect
        name="roles"
        label={formatMessage({ id: 'UserRole' })}
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
      <PhoneNumber name="phone" label={formatMessage({ id: 'Phone' })} format="string" />,
      <Input name="email" label={formatMessage({ id: 'Email' })} rule="EMAIL LEN-0-100" />,
      <TextArea name="description" label={formatMessage({ id: 'UserDescription' })} block />
    ];
    const UserFormInner = get(plugins, 'tenantAdmin.UserFormInner');
    if (UserFormInner && (UserFormInner.$$typeof || typeof UserFormInner.type === 'function')) {
      return <UserFormInner column={1} list={formInner} />;
    }

    return <FormInfo column={1} list={formInner} />;
  });

  return useMemo(() => {
    return getFormInner();
  }, [getFormInner]);
});

export default withLocale(FormInnerInner);
