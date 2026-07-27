export const resolveUserOrgId = (item, activeOrgId) => {
  if (item?.tenantOrg?.id != null) {
    return String(item.tenantOrg.id);
  }
  if (Array.isArray(item?.tenantOrgs) && item.tenantOrgs[0]?.id != null) {
    return String(item.tenantOrgs[0].id);
  }
  if (Array.isArray(item?.tenantOrgIds) && item.tenantOrgIds.length) {
    return String(item.tenantOrgIds[0]);
  }
  if (activeOrgId != null) {
    return String(activeOrgId);
  }
  return null;
};
