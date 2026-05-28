/**
 * 表单中的组织多选转为 API 所需的 id 数组。
 *
 * @param {unknown} tenantOrgIds
 * @returns {string[]}
 */
export function pickTenantOrgIdsFromForm(tenantOrgIds) {
  if (tenantOrgIds == null) {
    return [];
  }
  const list = Array.isArray(tenantOrgIds) ? tenantOrgIds : [tenantOrgIds];
  const ids = [];
  for (const item of list) {
    if (item == null || item === '') {
      continue;
    }
    if (typeof item === 'object' && item.id != null && item.id !== '') {
      ids.push(String(item.id));
    } else {
      ids.push(String(item));
    }
  }
  return [...new Set(ids)];
}

export function mapUserOrgIdsToFormValue(data) {
  if (Array.isArray(data?.tenantOrgs) && data.tenantOrgs.length) {
    return data.tenantOrgs.map(org => ({
      id: org.id,
      name: org.name || org.id
    }));
  }
  if (Array.isArray(data?.tenantOrgIds) && data.tenantOrgIds.length) {
    return data.tenantOrgIds.map(id => ({
      id,
      name: data.tenantOrg?.id === id ? data.tenantOrg.name : id
    }));
  }
  if (data?.tenantOrg?.id) {
    return [{ id: data.tenantOrg.id, name: data.tenantOrg.name }];
  }
  return [];
}

/** 将表单数据转换为 API 提交格式（处理组织 ID 映射） */
const transformUserFormData = (formData, existingData) => {
  const tenantOrgIds = pickTenantOrgIdsFromForm(formData.tenantOrgIds);
  return Object.assign({}, formData, existingData ? { id: existingData.id } : null, {
    tenantOrgIds
  });
};

export default transformUserFormData;
