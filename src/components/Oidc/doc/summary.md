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
