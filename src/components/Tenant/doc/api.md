## Tenant 组件

租户管理系统组件，提供完整的租户管理功能，包括公司信息管理、组织架构管理、用户管理、角色权限管理等。

## 主组件 Tenant

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 路由基础路径 | string | - |
| navigation | 导航配置 | object | {} |
| list | 自定义路由配置 | array | [] |
| children | 子元素 | ReactNode | - |

## 子组件

### CompanyInfo 公司信息

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 公司数据 | object | - |
| onSubmit | 提交回调 | function | - |
| hasEdit | 是否显示编辑按钮 | boolean | true |
| apis | API 配置 | object | - |

### OrgInfo 组织架构

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 组织列表数据 | array | [] |
| companyName | 公司名称 | string | - |
| tenantId | 租户 ID（管理端 `tenantAdmin` 场景传入，用于批量导入等接口 body） | string | - |
| apis | API 配置（含 create、save、remove、userList、import 等） | object | - |
| onSuccess | 操作成功回调 | function | - |

### UserList 用户列表

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API 配置 | object | - |
| topOptionsSize | 顶部操作按钮尺寸 | string | - |
| onMount | 挂载回调 | function | - |
| children | 自定义渲染 | function | - |

### Role 角色管理

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API 配置 | object | - |

角色列表 `apis.list` 支持 `params.filter`：

| 字段 | 说明 |
| --- | --- |
| keyword | 名称/编码/描述模糊搜索 |
| type | 角色类型：`system` / `custom` |
| status | 状态：`open` / `closed` |

### Permission 权限管理

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API 配置 | object | - |
| children | 自定义渲染 | function | - |

### LoginTenant 租户登录

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| tenantPath | 登录成功跳转路径 | string | - |
| children | 自定义渲染 | function | - |

### JoinInvitation 邀请加入

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 基础路径 | string | '' |
| children | 自定义渲染 | function | - |

### Setting 系统设置

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API 配置 | object | - |
| baseUrl | 基础路径 | string | - |

### TenantUserSelect 按组织选择租户用户

参考 `UserSelect`，用于在表单中先选组织、再选租户成员。左侧为组织树，右侧为成员选择器（`SuperSelect`），成员列表按所选组织及其子组织过滤（`filter.tenantOrgId`）。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 表单字段名称 | string | - |
| label | 表单标签 | string | - |
| rule | 校验规则，如 `REQ` | string | - |
| placeholder | 成员选择占位文本 | string | - |
| single | 是否单选 | boolean | true |
| disabled | 是否禁用 | boolean | false |
| userStatus | 成员状态筛选：`open` / `closed`（兼容 `active` → `open`、`inactive` → `closed`） | string | - |
| companyName | 组织树根节点（公司）名称 | string | - |
| showOrgRoot | 是否展示公司根节点 | boolean | true |
| orgApi | 自定义组织列表 API，默认 `apis.tenant.orgList` | object | - |
| userApi | 自定义成员列表 API，默认 `apis.tenant.userList` | object | - |

## API 配置说明

```javascript
const apis = {
  tenant: {
    // 用户相关
    getUserInfo: { /* 获取当前用户信息 */ },
    getOrgList: { /* 获取组织列表 */ },
    saveOrg: { /* 保存组织 */ },
    createOrg: { /* 创建组织 */ },
    removeOrg: { /* 删除组织 */ },
    getUserList: { /* 获取用户列表 */ },
    createUser: { /* 创建用户 */ },
    saveUser: { /* 保存用户 */ },
    removeUser: { /* 删除用户 */ },
    // 角色相关
    getRoleList: { /* 获取角色列表 */ },
    createRole: { /* 创建角色 */ },
    saveRole: { /* 保存角色 */ },
    removeRole: { /* 删除角色 */ },
    permissionSave: { /* 保存角色权限 */ },
    // 租户相关
    getTenantList: { /* 获取租户列表 */ },
    getPermissionList: { /* 获取权限列表 */ },
    savePermission: { /* 保存权限 */ },
    // 邀请相关
    parseJoinToken: { /* 解析邀请令牌 */ },
    join: { /* 加入租户 */ }
  }
};
```

## 依赖模块

- `components-core:FormInfo` - 表单组件
- `components-core:Layout` - 布局组件
- `components-core:Global@usePreset` - 全局配置
- `components-admin:Authenticate@AfterUserLoginLayout` - 用户登录后布局
