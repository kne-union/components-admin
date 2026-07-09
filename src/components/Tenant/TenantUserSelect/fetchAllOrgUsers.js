import merge from 'lodash/merge';
import { resolveUserOrgId } from './resolveUserOrgId';

export const mapUserToSelectedValue = (item, activeOrgId) => ({
  id: item.id,
  name: item.name,
  tenantOrgId: resolveUserOrgId(item, activeOrgId)
});

const normalizePageData = response => {
  if (Array.isArray(response?.pageData)) {
    return response.pageData;
  }
  if (Array.isArray(response?.data?.pageData)) {
    return response.data.pageData;
  }
  return [];
};

export const fetchAllOrgUsers = async (api, total) => {
  if (typeof api?.loader !== 'function' || !total) {
    return [];
  }
  const response = await api.loader({
    params: merge({}, api.params, {
      perPage: total,
      currentPage: 1
    })
  });
  return normalizePageData(response);
};
