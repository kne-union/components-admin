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
