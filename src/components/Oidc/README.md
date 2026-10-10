# Oidc

### 概述

配合 `@kne/fastify-oidc` 使用的前端 OIDC 登录组件集，让多个业务项目共用一个登录中心：用户只登录一次，就能在各个项目之间免登录跳转，并按租户切换身份。

**核心特性**

- **登录交互页**：`Interaction` 一页覆盖账号登录、多租户选择、第三方授权确认三个步骤，复用账号中心的登录界面风格
- **浏览器端 OIDC client**：`createOidcClient` 基于 oauth4webapi 实现授权码 + PKCE，自动保存与刷新令牌，多标签页共享登录态
- **请求自动带令牌**：`client.registerInterceptors` 接入 `@kne/axios-fetch`，自动注入 `Authorization` 头，401 时自动重新登录
- **可选 DPoP**：开启后令牌与浏览器内不可导出的密钥绑定，令牌被窃取也无法在其它设备使用
- **租户无感切换**：`TenantSwitch` 使用 `prompt=none` + `tenant_id` 静默换取新租户令牌，无需再次输入密码

**适用场景**

- 多个业务系统需要统一登录、单点登录 / 单点退出
- SaaS 多租户系统，用户需要在不同租户间切换
- 原有 `X-User-Token` 登录方式逐步迁移到标准 OIDC

**技术亮点**

- 令牌只在浏览器内存与 localStorage 中流转，refresh token 轮换由 Web Locks 串行化，避免多标签页并发刷新导致掉线
- 静默登录失败（会话过期 / 需要交互）时自动回退为交互式登录
- 所有组件既可通过 `client` 属性传入实例，也可从 preset 的 `oidc` 读取，便于在业务项目中统一配置


### 示例

#### 示例代码

- 登录交互页：账号登录(全屏)
- IdP 将未登录用户重定向到交互页，Interaction 根据 uid 拉取交互详情，prompt 为 login 时展示账号密码登录，提交后跳转回授权流程。
- _Oidc(@components/Oidc),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { Interaction } = _Oidc;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Interaction uid="demo-login" systemName="统一登录中心" />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 登录交互页：选择租户(全屏)
- 账号属于多个租户时，prompt 为 tenant，展示可进入的租户列表，选择后签发带租户信息的令牌。
- _Oidc(@components/Oidc),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { Interaction } = _Oidc;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Interaction uid="demo-tenant" systemName="统一登录中心" />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 登录交互页：授权确认(全屏)
- 第三方应用首次请求授权时，prompt 为 consent，展示应用名称与申请的 scope，用户可同意或拒绝。
- _Oidc(@components/Oidc),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { Interaction } = _Oidc;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Interaction uid="demo-consent" systemName="统一登录中心" />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 登录态守卫、租户切换与退出
- OidcAuthenticate 保证已登录才渲染内容；TenantSwitch 通过 prompt=none 静默切换租户；OidcLogout 走 end_session 退出。示例使用 preset 中的模拟 client。
- _Oidc(@components/Oidc),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { OidcAuthenticate, TenantSwitch, OidcLogout } = _Oidc;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card, Flex, Typography } = antd;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <OidcAuthenticate>
        {({ client }) => (
          <Card title="人力资源门户">
            <Flex vertical gap={16}>
              <Typography.Text type="secondary">已登录应用：{client.config.clientId}</Typography.Text>
              <Flex gap={12} wrap>
                <TenantSwitch />
                <OidcLogout danger />
              </Flex>
            </Flex>
          </Card>
        )}
      </OidcAuthenticate>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 登录回调页
- Callback 用授权码兑换令牌并回到登录前页面；传入 onSuccess 可自定义跳转。
- _Oidc(@components/Oidc),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { Callback } = _Oidc;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Result } = antd;
const { useState } = React;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [result, setResult] = useState(null);
  return (
    <PureGlobal preset={mockPreset}>
      {result ? <Result status="success" title="登录完成" subTitle={&#96;即将返回：${result.returnTo}&#96;} /> : <Callback onSuccess={setResult} />}
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

### createOidcClient

创建浏览器端 OIDC client（授权码 + PKCE），返回 client 实例。业务项目通常在 `preset.js` 的 `globalInit` 中创建，并作为 preset 的 `oidc` 字段注入，供下方组件读取。

#### 参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| clientId | string | 是 | - | 在 IdP 注册的 client_id（fastify-oidc 的 `OIDC_CLIENT_ID`） |
| issuer | string | 否 | `${origin}/oidc` | IdP issuer 地址，需与 fastify-oidc 的 `issuer` 一致 |
| redirectUri | string | 否 | `${origin}${PUBLIC_URL}/oidc-callback` | 登录回调地址，需在 client 的 `redirect_uris` 中登记 |
| postLogoutRedirectUri | string | 否 | `${origin}${PUBLIC_URL}/` | 退出后回跳地址，需在 client 的 `post_logout_redirect_uris` 中登记 |
| resource | string | 否 | - | 资源指示（audience），不传时 IdP 使用 client 允许的第一个资源 |
| scope | string | 否 | `openid profile offline_access api` | 申请的 scope |
| dpop | boolean | 否 | false | 是否开启 DPoP，开启后令牌绑定浏览器密钥（密钥存于 IndexedDB） |
| storageKey | string | 否 | `kne-oidc:{clientId}` | 令牌在 localStorage / sessionStorage 中的 key 前缀；默认按 clientId 隔离，同源部署的多个应用互不覆盖 |
| refreshSkew | number | 否 | 30 | 令牌到期前多少秒开始刷新 |
| extraParams | object | 否 | {} | 每次授权请求附加的参数（如 `ui_locales`） |

#### client 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| login | `{ returnTo?, prompt?, tenantId?, loginHint?, params? }` | Promise（页面跳转，不会 resolve） | 跳转到 IdP 授权页；`tenantId` 对应授权参数 `tenant_id` |
| handleCallback | `url?: string` | `Promise<{ returnTo }>` | 在回调页用授权码兑换令牌；`prompt=none` 失败时自动改为交互式登录 |
| refresh | - | `Promise<tokenSet>` | 使用 refresh token 刷新，多标签页串行执行 |
| getAccessToken | - | `Promise<string \| null>` | 获取有效 access token，临近过期自动刷新 |
| getAuthHeaders | `{ method, url }` | `Promise<object>` | 生成请求头：`Authorization: Bearer …`，DPoP 令牌额外带 `DPoP` proof |
| registerInterceptors | `interceptors, { onUnauthorized? }` | void | 传给 `@kne/axios-fetch` 的 `registerInterceptors`；请求自动带令牌，401 默认清除令牌并重新登录（10 秒内只触发一次） |
| switchTenant | `tenantId, { returnTo? }` | Promise | 以 `prompt=none` + `tenant_id` 静默切换租户 |
| logout | `{ returnTo? }` | Promise | 清除本地令牌（及 DPoP 密钥），跳转 IdP `end_session` 退出 |
| isAuthenticated | - | boolean | 本地是否有可用（或可刷新）的令牌 |
| getTokenSet | - | object \| null | 当前令牌：`accessToken`、`refreshToken`、`idToken`、`tokenType`、`expiresAt` |
| getClaims | - | object \| null | 解码后的 access token claims |
| getIdTokenClaims | - | object \| null | 解码后的 id token claims |
| getTenantId | - | string \| null | 当前令牌中的租户 ID（读取以 `/tenant_id` 结尾的命名空间 claim） |
| subscribe | `listener: (tokenSet) => void` | `() => void` | 订阅令牌变化（含其它标签页），返回取消订阅函数 |
| discover | - | Promise | 获取 IdP discovery 元数据（带缓存） |

### Interaction

IdP 登录交互页，路由路径需与 fastify-oidc 的 `interactionPage`（默认 `/oidc-interaction`）一致。从 URL `uid` 读取交互，按步骤展示登录 / 选择租户 / 授权确认。该路由与 `Callback` 路由都不能被 `OidcAuthenticate` 包裹。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| uid | string | 否 | URL 参数 `uid` | 交互 ID |
| systemName | ReactNode | 否 | - | 左侧系统名称 |
| systemLogo | string \| ReactNode | 否 | - | 左侧系统 logo |
| loginLeftInner | ReactNode | 否 | 与 Account 一致的 workforce 插画 | 左侧内容 |
| loginTitle | string | 否 | 其它 client 跳转来时为 `登录到 {clientName}`，本系统（`preset.oidc` 的 clientId）为 `登录` | 登录步骤标题 |
| accountType | `'email'` \| `'phone'` | 否 | `'email'` | 登录账号类型 |
| registerUrl | string | 否 | - | 注册页地址，传入后显示注册入口 |
| forgetUrl | string | 否 | - | 忘记密码页地址，传入后显示入口 |
| allowLanguageSwitch | boolean | 否 | `true` | 右上角显示语言切换，与 Account 登录页一致 |

交互页外层与 Account 登录页相同（`Account` 的 `Layout`：主题色全屏背景、卡片居中）。本系统自己登录（交互的 client 即 `preset.oidc` 的 clientId）时不显示「取消登录」；其它 client（子项目）跳转来时显示，取消后带 `access_denied` 回到该子项目。

登录会话失效（uid 过期 / 已使用）或缺少 uid 时显示「登录会话已失效」与「返回登录」：有 `preset.oidc` 时调用 `oidc.login({ returnTo: '/' })` 重新发起登录，否则跳回应用首页。

### Callback

登录回调页，路由路径需与 `redirectUri` 一致（默认 `/oidc-callback`）。外层与交互页相同；兑换失败时显示「登录失败」，用户在交互页取消登录（`access_denied`）时显示「已取消登录」，均提供「重新登录」按钮。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| client | object | 否 | preset.oidc | OIDC client 实例 |
| onSuccess | `({ returnTo }) => void` | 否 | 跳转回 returnTo | 兑换令牌成功后的回调 |
| systemName | ReactNode | 否 | - | 左侧系统名称 |
| systemLogo | string \| ReactNode | 否 | - | 左侧系统 logo |
| loginLeftInner | ReactNode | 否 | 与 Account 一致的 workforce 插画 | 左侧内容 |

### OidcAuthenticate

登录态守卫：没有可用令牌时自动跳转登录，有令牌时渲染子节点。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| client | object | 否 | preset.oidc | OIDC client 实例 |
| loginParams | object | 否 | - | 跳转登录时传给 `client.login` 的参数 |
| children | ReactNode \| `({ client }) => ReactNode` | 是 | - | 已登录时渲染的内容 |

### TenantSwitch

租户切换下拉按钮，列表来自 `apis.tenant.availableList`，当前租户读取自令牌。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| client | object | 否 | preset.oidc | OIDC client 实例 |
| api | object | 否 | `apis.tenant.availableList` | 可用租户列表接口 |
| returnTo | string | 否 | 当前页面 | 切换后回到的页面 |
| children | `({ list, currentTenantId, switching, switchTenant }) => ReactNode` | 否 | - | 自定义渲染 |
| 其它 | ButtonProps | 否 | - | 透传给默认按钮 |

### OidcLogout

退出登录按钮，调用 `client.logout`。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| client | object | 否 | preset.oidc | OIDC client 实例 |
| returnTo | string | 否 | `postLogoutRedirectUri` | 退出后回跳地址 |
| children | ReactNode | 否 | `退出登录` | 按钮文案 |
| 其它 | ButtonProps | 否 | - | 透传给按钮 |

### 工具方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| createProof | `{ keyPair, method, url, accessToken?, nonce? }` | `Promise<string>` | 生成访问资源服务用的 DPoP proof |
| decodeJwtPayload | `token: string` | object \| null | 解码 JWT payload（不验签） |

### 依赖接口

`getApis` 新增 `oidcPrefix`（默认 `/api/oidc`），对应 `apis.oidc.config` 与 `apis.oidc.interaction`：

| 接口 | 方法 | 地址 |
|--------|------|------|
| config | GET | `{oidcPrefix}/config`（免登录，Account 登录页据此判断是否展示 SSO） |
| details | GET | `{oidcPrefix}/interaction/{uid}/details` |
| login | POST | `{oidcPrefix}/interaction/{uid}/login` |
| tenant | POST | `{oidcPrefix}/interaction/{uid}/tenant` |
| confirm | POST | `{oidcPrefix}/interaction/{uid}/confirm` |
| abort | POST | `{oidcPrefix}/interaction/{uid}/abort` |
