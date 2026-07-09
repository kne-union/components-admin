import merge from 'lodash/merge';
import { resolveUserOrgId } from './resolveUserOrgId';

const findOrgName = (orgList, orgId) => orgList.find(item => String(item.id) === String(orgId))?.name || '';

const resolveInitialOrg = async ({ selected, orgList, userApi }) => {
  const target = selected[0];
  if (!target) {
    return null;
  }

  if (target.tenantOrgId != null) {
    const orgId = String(target.tenantOrgId);
    return {
      orgId,
      orgName: findOrgName(orgList, orgId),
      userId: target.id
    };
  }

  if (typeof userApi?.loader !== 'function') {
    return null;
  }

  const response = await userApi.loader({
    params: merge({}, userApi.params, {
      perPage: 1000,
      currentPage: 1
    })
  });
  const users = response?.pageData || response?.data?.pageData || [];
  const user = users.find(item => String(item.id) === String(target.id));
  if (!user) {
    return null;
  }

  const orgId = resolveUserOrgId(user);
  if (!orgId) {
    return null;
  }

  return {
    orgId,
    orgName: findOrgName(orgList, orgId) || user.tenantOrg?.name || '',
    userId: target.id
  };
};

export default resolveInitialOrg;
