const decodeQueryValue = value => {
  if (value == null || value === '') {
    return '';
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * 读取用户列表 URL 筛参（仅应在首屏调用一次），并记录需从地址栏移除的 query key。
 */
export const readUserListUrlFilters = (
  searchParams,
  { initialTenantOrgId, initialOrgName, initialUserId, allowQueryIdForUserFilter } = {}
) => {
  const consumedKeys = [];

  const take = key => {
    if (!searchParams.has(key)) {
      return null;
    }
    consumedKeys.push(key);
    return searchParams.get(key);
  };

  let tenantOrgId = take('tenantOrgId') || initialTenantOrgId || null;
  let orgName = take('orgName') || initialOrgName || '';
  let userId = take('userId') || take('filterUserId') || initialUserId || null;

  if (!userId && allowQueryIdForUserFilter) {
    const idFromQuery = take('id');
    if (idFromQuery) {
      userId = idFromQuery;
    }
  }

  return {
    tenantOrgId,
    orgName: decodeQueryValue(orgName),
    userId,
    consumedKeys
  };
};

export const stripUserListUrlFilterKeys = (searchParams, consumedKeys) => {
  if (!consumedKeys?.length) {
    return null;
  }
  const next = new URLSearchParams(searchParams);
  let changed = false;
  consumedKeys.forEach(key => {
    if (next.has(key)) {
      next.delete(key);
      changed = true;
    }
  });
  return changed ? next : null;
};
