/**
 * 从 URL 或外部参数构建用户列表初始筛选项（含默认「开启」状态）。
 */
const buildUserListFilterFromSearch = ({ formatMessage, tenantOrgId, orgName, userId }) => {
  const items = [
    {
      name: 'status',
      label: formatMessage({ id: 'FilterStatus' }),
      value: { label: formatMessage({ id: 'Open' }), value: 'open' }
    }
  ];

  const filterUserId = userId != null ? String(userId).trim() : '';
  if (filterUserId) {
    items.push({
      name: 'id',
      label: formatMessage({ id: 'FilterUserId' }),
      value: { label: filterUserId, value: filterUserId }
    });
  }

  const orgId = tenantOrgId != null ? String(tenantOrgId).trim() : '';
  if (orgId) {
    const name = orgName != null ? String(orgName) : orgId;
    items.push({
      name: 'tenantOrgId',
      label: formatMessage({ id: 'Department' }),
      value: {
        label: name,
        value: orgId,
        id: orgId,
        name
      }
    });
  }
  return items;
};

export default buildUserListFilterFromSearch;
