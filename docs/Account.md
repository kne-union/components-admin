# Account

### 概述

Account 组件提供了完整的用户账号管理功能，包括登录、注册、修改密码、忘记密码、重置密码等功能。支持邮箱和手机号两种账号类型，提供了统一的 UI 风格和交互体验。


### 示例(全屏)

#### 示例代码

- Login
- 登录
- _Account(@components/Account),antd(antd)

```jsx
const { LoginOuterContainer, Login } = _Account;
const { Flex, Radio, Space, message } = antd;
const { useState } = React;

const BaseExample = () => {
  const [type, setType] = useState('email');
  
  return (
    <Flex vertical gap={20}>
      <Flex justify="center">
        <Space>
          <span>登录类型:</span>
          <Radio.Group
            value={type}
            onChange={e => {
              setType(e.target.value);
            }}
            options={[
              { label: '邮箱登录', value: 'email' },
              { label: '手机登录', value: 'phone' }
            ]}
          />
        </Space>
      </Flex>
      <LoginOuterContainer
        title="企业管理系统"
        logo="https://api.dicebear.com/7.x/shapes/svg?seed=company">
        <Login
          type={type}
          registerUrl="/register"
          forgetUrl="/forget"
          onSubmit={formData => {
            console.log('登录信息:', formData);
            message.success(&#96;登录成功: ${formData[type]}&#96;);
          }}
        />
      </LoginOuterContainer>
    </Flex>
  );
};

render(<BaseExample />);

```

- Register
- 注册
- _Account(@components/Account),antd(antd)

```jsx
const { LoginOuterContainer, Register } = _Account;
const { Flex, Radio, Space, message } = antd;
const { useState } = React;

const BaseExample = () => {
  const [type, setType] = useState('email');
  
  return (
    <Flex vertical gap={20}>
      <Flex justify="center">
        <Space>
          <span>注册类型:</span>
          <Radio.Group
            value={type}
            onChange={e => {
              setType(e.target.value);
            }}
            options={[
              { label: '邮箱注册', value: 'email' },
              { label: '手机注册', value: 'phone' }
            ]}
          />
        </Space>
      </Flex>
      <Register
        type={type}
        loginUrl="/login"
        sendVerificationCode={({ type, data }) => {
          console.log(&#96;发送验证码到 ${type}:&#96;, data);
          message.success(&#96;验证码已发送到 ${data}&#96;);
          return Promise.resolve();
        }}
        onSubmit={formData => {
          console.log('注册信息:', formData);
          message.success('注册成功');
        }}
      />
    </Flex>
  );
};

render(<BaseExample />);

```

- Modify
- 修改密码
- _Account(@components/Account),antd(antd)

```jsx
const { Modify } = _Account;
const { Flex, message } = antd;

const BaseExample = () => {
  return (
    <Flex vertical gap={20}>
      <Modify
        type="email"
        account="zhangsan@company.com"
        onSubmit={formData => {
          console.log('修改密码:', formData);
          message.success('密码修改成功');
        }}
      />
      <Modify
        type="phone"
        account="+86 13800138000"
        onSubmit={formData => {
          console.log('修改密码:', formData);
          message.success('密码修改成功');
        }}
      />
    </Flex>
  );
};

render(<BaseExample />);

```

- ForgetByEmail
- 忘记密码（邮箱）
- _Account(@components/Account),antd(antd)

```jsx
const { LoginOuterContainer, ForgetByEmail } = _Account;
const { message } = antd;

const BaseExample = () => {
  return (
    <LoginOuterContainer title="企业管理系统">
      <ForgetByEmail
        loginUrl="/login"
        onSubmit={(formData, callback) => {
          console.log('忘记密码邮箱:', formData);
          // 模拟发送重置密码邮件
          setTimeout(() => {
            callback();
            message.success('重置密码链接已发送到您的邮箱');
          }, 1000);
        }}
      />
    </LoginOuterContainer>
  );
};

render(<BaseExample />);

```

- ResetPassword
- 重置密码
- _Account(@components/Account),antd(antd)

```jsx
const { ResetPassword } = _Account;
const { Flex, message } = antd;

const BaseExample = () => {
  return (
    <Flex vertical gap={20}>
      <ResetPassword
        type="email"
        account="zhangsan@company.com"
        loginUrl="/login"
        onSubmit={formData => {
          console.log('重置密码:', formData);
          message.success('密码重置成功，请使用新密码登录');
        }}
      />
      <ResetPassword
        type="phone"
        account="+86 13800138000"
        loginUrl="/login"
        onSubmit={formData => {
          console.log('重置密码:', formData);
          message.success('密码重置成功，请使用新密码登录');
        }}
      />
    </Flex>
  );
};

render(<BaseExample />);

```

### API

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
