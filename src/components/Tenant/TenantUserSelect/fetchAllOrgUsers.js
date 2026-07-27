import { resolveUserOrgId } from './resolveUserOrgId';
import fetchUserList from './fetchUserList';

export const mapUserToSelectedValue = (item, activeOrgId, { valueKey = 'id', labelKey = 'name' } = {}) => ({
  id: item?.[valueKey] ?? item?.id,
  name: item?.[labelKey] ?? item?.name,
  tenantOrgId: resolveUserOrgId(item, activeOrgId)
});

export const fetchAllOrgUsers = async (api, total) => {
  if (!total || (!api?.loader && !api?.url)) {
    return [];
  }
  return fetchUserList(api, {
    perPage: total,
    currentPage: 1
  });
};
