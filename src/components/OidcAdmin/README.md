# OidcAdmin

### 概述

`@kne/fastify-oidc` 登录中心的管理后台，管理员可以在这里登记接入的应用、声明受保护的接口、轮换签名密钥，以及查看和结束用户的登录会话。

**核心特性**

- **应用管理**：登记公开应用（SPA，PKCE）和机密应用（后端服务），配置回调地址、授权方式和可访问的资源服务；机密应用的密钥只在创建 / 重置时展示一次
- **资源服务**：声明每个项目的 API 标识（audience）、可授予的 scope、令牌有效期，以及令牌是否携带权限列表
- **签名密钥**：查看使用中 / 待启用 / 已退役的密钥，一键轮换，旧令牌在保留期内仍可验证
- **登录会话**：按用户查看会话和已登录的应用，支持结束单个会话、撤销全部令牌（保留会话可静默重登）、强制下线
- **应用中心**：查看子应用注册的权限树与租户模式，启停或删除子应用；配合 `TenantApps` 按租户开通子应用

**适用场景**

- 多项目统一登录中心的日常运维
- 新项目接入单点登录时登记 client 与资源服务
- 账号异常、员工离职时撤销令牌或强制下线
- 多租户宿主给不同租户开通子应用及其功能

**技术亮点**

- 基于 BizUnit 的配置化列表页，与其它管理模块交互一致
- 表单与 oidc-provider client metadata 双向转换，编辑时保留表单之外的高级配置


### 示例(全屏)

#### 示例代码

- 基础用法
- OIDC 管理后台：左侧菜单切换应用管理、资源服务、签名密钥、登录会话、应用中心五个页面。
- _OidcAdmin(@components/OidcAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { default: OidcAdmin } = _OidcAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/OidcAdmin/oidc';
const pageProps = { menuFixed: false };

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path={&#96;${baseUrl}/*&#96;} element={<OidcAdmin baseUrl={baseUrl} pageProps={pageProps} />} />
          <Route path="*" element={<Navigate to={baseUrl} replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 登录会话管理
- 单独使用 SessionManager：选择用户查看其登录会话，可结束单个会话、撤销全部令牌或强制下线。
- _OidcAdmin(@components/OidcAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { SessionManager } = _OidcAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <SessionManager defaultUserId="1" pageProps={{ menuFixed: false }} />
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 应用中心
- 单独使用 AppManager：查看子应用注册的租户模式、关联应用与权限数，「查看权限」以只读权限树展示注册内容，可启用 / 停用或删除子应用。
- _OidcAdmin(@components/OidcAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { AppManager } = _OidcAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <AppManager pageProps={{ menuFixed: false }} />
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 租户开通子应用
- TenantApps 按租户开关子应用：开通写入该应用全部功能权限，关闭移除其下全部权限；通常经 plugins.admin.tenant.appendTabDetails 挂到租户详情页签。
- _OidcAdmin(@components/OidcAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { TenantApps } = _OidcAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card } = antd;

const tenant = { id: 'tenant-001', name: '科技创新有限公司' };

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Card title={&#96;${tenant.name} · 子应用&#96;}>
        <TenantApps tenant={tenant} />
      </Card>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

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
