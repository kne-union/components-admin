// 由宿主系统（fastify-oidc 应用中心）同步过来的租户：基本信息、权限、角色、组织、成员均以宿主为准，本地只读
const isManagedTenant = tenant => !!tenant?.options?.managedBy?.hostTenantId;

export default isManagedTenant;
