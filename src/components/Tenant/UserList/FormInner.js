import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { Flex } from 'antd';
import get from 'lodash/get';
import merge from 'lodash/merge';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';
import getRoleListApi from '../Role/getRoleListApi';

const markSyncedOrgDisabled = items => {
  if (!Array.isArray(items)) return items;
  return items.map(item => {
    const newItem = { ...item };
    if (item.syncSource) {
      newItem.disabled = true;
    }
    if (item.children) {
      newItem.children = markSyncedOrgDisabled(item.children);
    }
    return newItem;
  });
};

const getOrgListApi = (apis, { disableSynced } = {}) => {
  if (!apis.orgList) return apis.orgList;
  if (!disableSynced) return apis.orgList;
  return merge({}, apis.orgList, {
    transformData: data => {
      if (Array.isArray(data)) {
        return markSyncedOrgDisabled(data);
      }
      return Object.assign({}, data, {
        pageData: markSyncedOrgDisabled(data.pageData || [])
      });
    }
  });
};

const FormInnerInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(({ remoteModules, apis, data }) => {
  const [FormInfo, usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const { plugins } = usePreset();
  const { Avatar, Input, PhoneNumber, TextArea, SuperSelectTree, SuperSelect } = FormInfo.fields;
  const isSynced = !!data?.synced;
  const orgListApi = useMemo(() => getOrgListApi(apis, { disableSynced: !isSynced }), [apis, isSynced]);
  const getFormInner = useRefCallback(() => {
    const formInner = [
      <Flex justify="center">
        <Avatar name="avatar" label={formatMessage({ id: 'Avatar' })} labelHidden interceptor="photo-string" />
      </Flex>,
      <Input name="name" label={formatMessage({ id: 'UserName' })} rule="REQ LEN-0-100" disabled={isSynced} />,
      <SuperSelectTree
        name="tenantOrgIds"
        label={formatMessage({ id: 'Departments' })}
        api={orgListApi}
        valueKey="id"
        labelKey="name"
        interceptor="array-output-value"
        disabled={isSynced}
      />,
      <SuperSelect
        name="roles"
        label={formatMessage({ id: 'UserRole' })}
        api={getRoleListApi(apis)}
        valueKey="id"
        labelKey="name"
        interceptor="array-output-value"
      />,
      <PhoneNumber name="phone" label={formatMessage({ id: 'Phone' })} format="string" disabled={isSynced} />,
      <Input name="email" label={formatMessage({ id: 'Email' })} rule="EMAIL LEN-0-100" disabled={isSynced} />,
      <TextArea name="description" label={formatMessage({ id: 'UserDescription' })} block disabled={isSynced} />
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
