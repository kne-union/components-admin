const mergeSelectedOrgIds = (prev, selectedList) => {
  const next = Object.assign({}, prev);
  (selectedList || []).forEach(item => {
    if (item?.id == null || item.tenantOrgId == null) {
      return;
    }
    next[String(item.id)] = String(item.tenantOrgId);
  });
  return next;
};

export const applySelectedOrgIds = (selectedList, orgIdByUserId) =>
  (selectedList || []).map(item =>
    Object.assign({}, item, {
      tenantOrgId: item.tenantOrgId != null ? item.tenantOrgId : orgIdByUserId[String(item.id)] || null
    })
  );

export default mergeSelectedOrgIds;
