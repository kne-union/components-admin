/** 统一租户用户结构，供 PersonalCard 映射（含 parseJoinToken / 列表行） */
const normalizeTenantUserForPersonalCard = tenantUser => {
  if (!tenantUser) {
    return tenantUser;
  }
  const data = typeof tenantUser.toJSON === 'function' ? tenantUser.toJSON() : Object.assign({}, tenantUser);

  if (Array.isArray(data.roleDetails) && data.roleDetails.length) {
    data.roles = data.roleDetails;
  }

  if (data.options == null && (data.position != null || data.joinDate != null)) {
    data.options = Object.assign(
      {},
      data.position != null ? { position: data.position } : null,
      data.joinDate != null ? { joinDate: data.joinDate } : null
    );
  }

  return data;
};

export default normalizeTenantUserForPersonalCard;
