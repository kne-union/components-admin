/** 从用户数据中提取角色名称，拼接为逗号分隔的字符串 */
const buildRolesTitle = data => {
  const roles = Array.isArray(data?.roles) && data.roles.length ? data.roles : data?.roleDetails;
  if (!Array.isArray(roles) || !roles.length) {
    return '';
  }
  return roles
    .map(item => (typeof item === 'string' ? item : item?.name))
    .filter(Boolean)
    .join(',');
};

export default buildRolesTitle;
