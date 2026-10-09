### OidcAdmin

OIDC 管理后台入口，内部使用 `AppChildrenRouter` 组织四个子页面，需挂在 `${baseUrl}/*` 路由下。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| baseUrl | string | 是 | - | 模块根路径，子页面为 `baseUrl`、`/resource-servers`、`/keys`、`/sessions` |
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

按用户查看登录会话，支持结束会话、撤销令牌、强制下线。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| baseUrl | string | 否 | - | 菜单根路径 |
| pageProps | object | 否 | {} | 页面配置 |
| defaultUserId | string | 否 | - | 默认查看的用户 ID |

### 工具方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| clientToFormData | `client: object` | object | 将 client 接口数据转换为表单值 |
| clientToPayload | `formData: object, previousMetadata?: object` | object | 将表单值转换为 client 接口参数，编辑时合并原 metadata |

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
