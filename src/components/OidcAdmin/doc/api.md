### OidcAdmin

OIDC 管理后台入口，内部使用 `AppChildrenRouter` 组织五个子页面，需挂在 `${baseUrl}/*` 路由下。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| baseUrl | string | 是 | - | 模块根路径，子页面为 `baseUrl`、`/resource-servers`、`/keys`、`/sessions`、`/apps` |
| pageProps | object | 否 | {} | 透传给各页面的 Page / TablePage 配置 |
| children | ReactNode | 否 | - | 透传给 `AppChildrenRouter` |

### ClientManager

应用（client）管理列表页：创建、编辑、启用 / 停用、删除、重置密钥。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| baseUrl | string | 否 | - | 菜单根路径 |
| pageProps | object | 否 | {} | 页面配置 |

### ResourceServerManager

资源服务（audience）管理列表页，资源标识创建后不可修改。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| baseUrl | string | 否 | - | 菜单根路径 |
| pageProps | object | 否 | {} | 页面配置 |

### KeyManager

签名密钥列表与轮换。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| baseUrl | string | 否 | - | 菜单根路径 |
| pageProps | object | 否 | {} | 页面配置 |

### SessionManager

基于 `BizUnit`（isNext）的登录会话列表：在顶部筛选中选择用户后展示其有效会话；操作列（BizUnit 自动追加）可结束单个会话，支持批量结束所选会话，工具栏可对该用户撤销全部令牌或强制下线。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| baseUrl | string | 否 | - | 菜单根路径 |
| pageProps | object | 否 | {} | 页面配置 |
| defaultUserId | string | 否 | - | 默认查看的用户 ID |

### AppManager

应用中心（宿主）：子应用启动时通过服务接口 `app/register` 自行注册权限树，这里不提供新建 / 编辑，只能查看与启停。列表展示应用编码、租户模式（`client` 由宿主提供租户接口，`independent` 本地接管宿主同步的租户）、关联的服务 client 与前端 client、资源标识、权限数与注册时间；「查看权限」以只读 `PermissionPanel` 展示注册的权限树；停用后该应用从所有租户的权限树中移除，删除后子应用下次启动会重新注册。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| baseUrl | string | 否 | - | 菜单根路径 |
| pageProps | object | 否 | {} | 页面配置 |

### TenantApps

按租户开关子应用（宿主），数据来自租户权限树中的应用中心节点（`apps`），只列出已启用的子应用。开通时写入 `apps`、`apps:<code>` 及该应用全部功能 code；关闭时移除 `apps:<code>` 前缀下的全部 code，没有任何子应用开通时一并移除 `apps`。更细的功能开关在租户「权限」页签中调整。

通常通过 `plugins.admin.tenant.appendTabDetails` 挂到 TenantAdmin 租户详情：

```javascript
plugins: {
  admin: {
    tenant: {
      appendTabDetails: [{ tab: '子应用', key: 'apps', component: TenantApps, index: 3 }]
    }
  }
}
```

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| tenant | object | 是 | - | 租户对象，至少包含 `id` |
| apis | object | 否 | `apis.tenantAdmin.permission` | 覆盖读写接口：`{ list, save }`，自动追加 `tenantId` |
| prefix | string | 否 | `'apps'` | 应用中心权限前缀，需与 fastify-oidc `appPermissionPrefix` 一致 |

### 工具方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| clientToFormData | `client: object` | object | 将 client 接口数据转换为表单值 |
| clientToPayload | `formData: object, previousMetadata?: object` | object | 将表单值转换为 client 接口参数，编辑时合并原 metadata |
| toggleAppCodes | `{ codes, appModule, enabled, prefix? }` | string[] | 计算开关某个子应用后的租户权限 code 列表，`TenantApps` 内部使用 |

### 依赖接口

`apis.oidc`（前缀 `oidcPrefix`，默认 `/api/oidc`），需要管理员权限：

| 分组 | 接口 | 方法 | 地址 |
|------|------|------|------|
| client | list / detail | GET | `/admin/client/list`、`/admin/client/detail` |
| client | create / save / setStatus / remove / rotateSecret | POST | `/admin/client/create`、`/save`、`/set-status`、`/remove`、`/rotate-secret` |
| resourceServer | list / detail | GET | `/admin/resource-server/list`、`/detail` |
| resourceServer | create / save / setStatus / remove | POST | `/admin/resource-server/create`、`/save`、`/set-status`、`/remove` |
| key | list | GET | `/admin/key/list` |
| key | rotate | POST | `/admin/key/rotate` |
| session | list | GET | `/admin/session/list?userId=` |
| session | revoke / revokeUser | POST | `/admin/session/revoke`、`/admin/session/revoke-user` |
| app | list / detail | GET | `/admin/app/list`、`/admin/app/detail` |
| app | setStatus / remove | POST | `/admin/app/set-status`、`/admin/app/remove` |

`TenantApps` 另依赖 `apis.tenantAdmin.permission.list / save`（fastify-tenant 租户权限接口）。
