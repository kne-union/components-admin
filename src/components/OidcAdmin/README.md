# OidcAdmin

### 概述

`@kne/fastify-oidc` 登录中心的管理后台，管理员可以在这里登记接入的应用、声明受保护的接口、轮换签名密钥，以及查看和结束用户的登录会话。

**核心特性**

- **应用管理**：登记公开应用（SPA，PKCE）和机密应用（后端服务），配置回调地址、授权方式和可访问的资源服务；机密应用的密钥只在创建 / 重置时展示一次
- **资源服务**：声明每个项目的 API 标识（audience）、可授予的 scope、令牌有效期，以及令牌是否携带权限列表
- **签名密钥**：查看使用中 / 待启用 / 已退役的密钥，一键轮换，旧令牌在保留期内仍可验证
- **登录会话**：按用户查看会话和已登录的应用，支持结束单个会话、撤销全部令牌（保留会话可静默重登）、强制下线

**适用场景**

- 多项目统一登录中心的日常运维
- 新项目接入单点登录时登记 client 与资源服务
- 账号异常、员工离职时撤销令牌或强制下线

**技术亮点**

- 基于 BizUnit 的配置化列表页，与其它管理模块交互一致
- 表单与 oidc-provider client metadata 双向转换，编辑时保留表单之外的高级配置


### 示例(全屏)

#### 示例代码

- 基础用法
- OIDC 管理后台：左侧菜单切换应用管理、资源服务、签名密钥、登录会话四个页面。
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

### API

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
