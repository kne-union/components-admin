### Account SSO 登录

`Account`（含登录 / 注册等路由的整体组件）在登录页根据 fastify-oidc 的 `GET {oidcPrefix}/config`（`apis.oidc.config`，免登录）自动判断是否展示 SSO：

| 场景 | 登录页表现 |
|----|----|
| 没有 OIDC client，或配置接口请求失败 | 只有账号密码登录（与原来一致） |
| `mode` 为 `standalone` 且 `isMain` 为 `true`（主系统） | 只有账号密码登录（主系统本身就是 IdP，不显示 SSO 入口） |
| `mode` 为 `standalone` 且非主系统 | 账号密码表单下方增加「单点登录（SSO）」按钮 |
| `mode` 为其它值（`central` 子项目） | 不显示密码表单，进入登录页直接跳转到主项目 IdP；注册、忘记密码、重置密码、修改密码路由重定向到登录页 |

OIDC client 默认取 preset 的 `oidc`（`components-admin:Oidc` 的 `createOidcClient`），业务项目需已挂载 `Oidc@Callback` 回调路由。SSO 跳转的 `returnTo` 取登录页 URL 的 `referer`，没有时为 `targetUrl`（默认 `/`）。

| 属性名 | 说明 | 类型 | 默认值 |
|----|----|----|----|
| sso | SSO 配置；传 `false` 关闭自动探测 | `false` \| `{ client? }` | - |
| sso.client | 显式指定 OIDC client | object | preset.oidc |

### Login 登录组件

| 属性名         | 说明            | 类型                 | 默认值     |
|-------------|---------------|--------------------|---------|
| title       | 登录标题          | string             | '登录'    |
| type        | 登录类型，支持邮箱或手机号 | 'email' \| 'phone' | 'email' |
| registerUrl | 注册页面链接        | string             | ''      |
| forgetUrl   | 忘记密码页面链接      | string             | ''      |
| onSubmit    | 表单提交回调函数      | (formData) => void | -       |

### Register 注册组件

| 属性名                  | 说明            | 类型                       | 默认值     |
|----------------------|---------------|--------------------------|---------|
| title                | 注册标题          | string                   | '注册'    |
| systemName           | 系统名称，显示在顶部横幅  | string                   | -       |
| type                 | 注册类型，支持邮箱或手机号 | 'email' \| 'phone'       | 'email' |
| loginUrl             | 登录页面链接        | string                   | ''      |
| sendVerificationCode | 发送验证码回调函数     | ({ type, data }) => void | -       |
| onSubmit             | 表单提交回调函数      | (formData) => void       | -       |
| topBanner            | 顶部横幅自定义内容     | ReactNode                | -       |
| className            | 自定义样式类名       | string                   | -       |

### Modify 修改密码组件

| 属性名        | 说明                  | 类型                 | 默认值     |
|------------|---------------------|--------------------|---------|
| title      | 标题                  | string             | '修改密码'  |
| systemName | 系统名称，显示在顶部横幅        | string             | -       |
| type       | 账号类型                | 'email' \| 'phone' | 'email' |
| account    | 账号信息（邮箱或手机号）        | string             | -       |
| isReset    | 是否为重置密码模式（不需要输入旧密码） | boolean            | false   |
| onSubmit   | 表单提交回调函数            | (formData) => void | -       |
| header     | 自定义头部内容             | ReactNode          | null    |
| topBanner  | 顶部横幅自定义内容           | ReactNode          | -       |
| className  | 自定义样式类名             | string             | -       |

### ForgetByEmail 忘记密码（邮箱）组件

| 属性名      | 说明       | 类型                           | 默认值    |
|----------|----------|------------------------------|--------|
| title    | 标题       | string                       | '忘记密码' |
| loginUrl | 登录页面链接   | string                       | ''     |
| onSubmit | 表单提交回调函数 | (formData, callback) => void | -      |

### ResetPassword 重置密码组件

| 属性名        | 说明           | 类型                 | 默认值      |
|------------|--------------|--------------------|----------|
| title      | 标题           | string             | '重置登录密码' |
| systemName | 系统名称，显示在顶部横幅 | string             | -        |
| type       | 账号类型         | 'email' \| 'phone' | 'email'  |
| account    | 账号信息（邮箱或手机号） | string             | -        |
| loginUrl   | 登录页面链接       | string             | ''       |
| onSubmit   | 表单提交回调函数     | (formData) => void | -        |
| topBanner  | 顶部横幅自定义内容    | ReactNode          | -        |
| className  | 自定义样式类名      | string             | -        |

### LoginOuterContainer 登录外层容器组件

| 属性名       | 说明           | 类型        | 默认值 |
|-----------|--------------|-----------|-----|
| title     | 系统标题         | string    | -   |
| logo      | 系统 Logo 图片地址 | string    | -   |
| leftInner | 左侧自定义内容      | ReactNode | -   |
| children  | 右侧内容区域       | ReactNode | -   |
| className | 自定义样式类名      | string    | -   |

### Logout 登出组件

| 属性名       | 说明             | 类型                | 默认值                       |
|-----------|----------------|-------------------|---------------------------|
| storeKeys | Token 存储键名配置   | { token: string } | { token: 'X-User-Token' } |
| domain    | Token 存储域名     | string            | -                         |
| loginUrl  | 登出后跳转的登录页面地址   | string            | '/account/login'          |
| ...props  | 其他 Button 组件属性 | ButtonProps       | -                         |

### useLogout Hook

用于获取登出函数的 Hook。

```javascript
const logout = useLogout({ storeKeys, domain, loginUrl });
```

| 参数名       | 说明           | 类型                | 默认值                       |
|-----------|--------------|-------------------|---------------------------|
| storeKeys | Token 存储键名配置 | { token: string } | { token: 'X-User-Token' } |
| domain    | Token 存储域名   | string            | -                         |
| loginUrl  | 登出后跳转的登录页面地址 | string            | '/account/login'          |

返回值：`() => void` - 执行登出操作的函数

子应用挂载在路径前缀下时（App Manager 注入 `window.runtimePublicUrl`，如 `/app/talent-saas`），以 `/` 开头的 `loginUrl` 会自动补上该前缀；登录成功按 `referer` 跳回时也会去掉该前缀，避免路由 basename 重复。
