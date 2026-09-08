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

const EMAIL_REG = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

export const normalizeContactPhone = phone => {
  if (phone == null || phone === '') {
    return '';
  }
  if (typeof phone === 'object') {
    return String(phone.phone ?? phone.value ?? phone.number ?? '').trim();
  }
  return String(phone).trim();
};

/** 是否已填写邮箱或手机（与后端 USER_CONTACT_REQUIRED 一致） */
export const hasTenantUserContact = (data = {}) => {
  const email = String(data.email ?? '').trim();
  const phone = normalizeContactPhone(data.phone);
  return !!(email || phone);
};

/** 非同步用户须至少填写邮箱或手机 */
export const createEmailOrPhoneRule = (formatMessage, { isSynced = false } = {}) => (value, context = {}) => {
  if (isSynced) {
    return { result: true, errMsg: '' };
  }
  if (hasTenantUserContact(context.data || {})) {
    return { result: true, errMsg: '' };
  }
  return {
    result: false,
    errMsg: formatMessage({ id: 'EmailOrPhoneRequired' })
  };
};

const createEmailFieldRule = (formatMessage, { isSynced = false } = {}) => {
  const contactRule = createEmailOrPhoneRule(formatMessage, { isSynced });
  return (value, context = {}) => {
    const contactResult = contactRule(value, context);
    if (!contactResult.result) {
      return contactResult;
    }
    const email = String(value ?? '').trim();
    if (!email) {
      return { result: true, errMsg: '' };
    }
    if (email.length > 100 || !EMAIL_REG.test(email)) {
      return { result: false, errMsg: formatMessage({ id: 'EmailInvalid' }) };
    }
    return { result: true, errMsg: '' };
  };
};

const revalidateAssociatedField = ({ target, openApi }) => {
  openApi.validateField({ name: target.name });
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
  const emailFieldRule = useMemo(() => createEmailFieldRule(formatMessage, { isSynced }), [formatMessage, isSynced]);
  const getFormInner = useRefCallback(() => {
    const formInner = [
      <Flex justify="center">
        <Avatar name="avatar" label={formatMessage({ id: 'Avatar' })} labelHidden interceptor="photo-string" directory="Avatar" />
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
      // PhoneNumber 内部会对 rule 做 string.split，不能传函数规则；联系方式校验放在 email + Create/Edit onSubmit
      <PhoneNumber name="phone" label={formatMessage({ id: 'Phone' })} format="string" disabled={isSynced} />,
      <Input
        name="email"
        label={formatMessage({ id: 'Email' })}
        rule={emailFieldRule}
        disabled={isSynced}
        associations={{
          fields: [{ name: 'phone' }],
          callback: revalidateAssociatedField
        }}
      />,
      <TextArea name="description" label={formatMessage({ id: 'UserRemark' })} block disabled={isSynced} />
    ];
    const UserFormInner = get(plugins, 'tenantAdmin.UserFormInner');
    if (UserFormInner && (UserFormInner.$$typeof || typeof UserFormInner.type === 'function')) {
      return <UserFormInner column={1} list={formInner} apis={apis} />;
    }

    return <FormInfo column={1} list={formInner} />;
  });

  // 勿对 getFormInner 做空依赖 useMemo：useRefCallback 引用稳定会导致字段 rule 首次渲染后不再更新
  return getFormInner();
});

export default withLocale(FormInnerInner);
