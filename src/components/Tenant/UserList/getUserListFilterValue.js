import { normalizeTenantUserStatus } from './normalizeTenantUserStatus';

const pickSelectValues = value => {
  if (value == null || value === '') {
    return [];
  }
  const list = Array.isArray(value) ? value : [value];
  return list
    .map(item => {
      if (item == null) {
        return null;
      }
      if (typeof item !== 'object') {
        return String(item);
      }
      if (item.value != null && item.value !== '') {
        return String(item.value);
      }
      if (item.id != null && item.id !== '') {
        return String(item.id);
      }
      return null;
    })
    .filter(Boolean);
};

/**
 * SuperSelectFilterItem 使用 valueKey=id 时筛选项为 { id, name }，
 * Filter.getFilterValue 默认只读取 { value }，需在此补全 roles 等字段。
 */
const getUserListFilterValue = (filter, getFilterValue) => {
  const value = getFilterValue(filter);

  if (value.id != null && value.id !== '') {
    value.id = String(value.id);
  }

  const rolesEntry = filter.find(item => item.name === 'roles');
  if (rolesEntry) {
    const roles = pickSelectValues(rolesEntry.value);
    if (roles.length) {
      value.roles = roles;
    } else {
      delete value.roles;
    }
  }

  const orgEntry = filter.find(item => item.name === 'tenantOrgId');
  if (orgEntry?.value != null && orgEntry.value !== '') {
    const orgValues = pickSelectValues(orgEntry.value);
    if (orgValues[0]) {
      value.tenantOrgId = orgValues[0];
    }
  }

  if (value.status != null && value.status !== '') {
    const raw =
      typeof value.status === 'object' && value.status !== null && 'value' in value.status
        ? value.status.value
        : value.status;
    const normalized = normalizeTenantUserStatus(raw);
    if (normalized) {
      value.status = normalized;
    } else {
      delete value.status;
    }
  }

  return value;
};

export default getUserListFilterValue;
