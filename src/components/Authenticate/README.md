# Authenticate

### 概述

用户权限和用户信息管理组件，提供用户信息获取、登录后布局、用户信息编辑等功能。支持普通用户、管理员和自定义用户场景。


### 示例(全屏)

#### 示例代码

- 用户登录后布局
- AfterUserLoginLayout 组件展示用户登录后的完整布局，包含顶部导航栏和用户工具
- _Authenticate(@components/Authenticate),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { AfterUserLoginLayout } = _Authenticate;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Typography, Card } = antd;

const { Title, Paragraph } = Typography;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <AfterUserLoginLayout 
        title="用户中心"
        navigation={{ isFixed: false }}
      >
        <Card>
          <Title level={4}>欢迎使用用户中心</Title>
          <Paragraph>
            这是一个用户登录后的布局示例。顶部导航栏显示用户信息和语言切换功能。
          </Paragraph>
        </Card>
      </AfterUserLoginLayout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 用户信息获取
- UserInfo 组件获取用户信息并展示，用户信息会被设置到全局上下文中供其他组件使用
- _Authenticate(@components/Authenticate),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { UserInfo } = _Authenticate;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const UserInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Global@GlobalValue']
})(({ remoteModules }) => {
  const [PureGlobal, GlobalValue] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <UserInfo>
        <GlobalValue globalKey="userInfo">
          {({ value }) => {
            const { nickname, email, avatar, description } = Object.assign({}, value?.value);
            return (
              <div style={{ padding: 20 }}>
                <h3>用户信息</h3>
                <p><strong>头像：</strong><img src={avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} /></p>
                <p><strong>昵称：</strong>{nickname}</p>
                <p><strong>邮箱：</strong>{email}</p>
                <p><strong>描述：</strong>{description}</p>
              </div>
            );
          }}
        </GlobalValue>
      </UserInfo>
    </PureGlobal>
  );
});

render(<UserInfoExample />);

```

- 编辑用户信息
- SaveUserInfo 组件提供用户信息编辑功能，点击按钮弹出表单进行编辑
- _Authenticate(@components/Authenticate),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { SaveUserInfo, UserInfo } = _Authenticate;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Button, Card, Space, Typography } = antd;

const { Title } = Typography;

const SaveUserInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <UserInfo>
        <Card style={{ maxWidth: 600, margin: '20px auto' }}>
          <Title level={4}>编辑用户信息</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <p>点击下方按钮可以编辑用户信息，包括头像、昵称、描述等。</p>
            <SaveUserInfo>
              {({ onClick }) => (
                <Button type="primary" onClick={onClick}>
                  编辑用户信息
                </Button>
              )}
            </SaveUserInfo>
          </Space>
        </Card>
      </UserInfo>
    </PureGlobal>
  );
});

render(<SaveUserInfoExample />);

```

- 管理员登录后布局
- AfterAdminUserLoginLayout 组件展示管理员登录后的布局，使用超级管理员信息
- _Authenticate(@components/Authenticate),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { AfterAdminUserLoginLayout } = _Authenticate;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Typography, Card } = antd;

const { Title, Paragraph } = Typography;

const AdminLayoutExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <AfterAdminUserLoginLayout 
        title="管理后台"
        navigation={{ isFixed: false }}
      >
        <Card>
          <Title level={4}>管理员控制台</Title>
          <Paragraph>
            这是管理员登录后的布局示例。顶部显示管理员信息和系统管理功能入口。
          </Paragraph>
        </Card>
      </AfterAdminUserLoginLayout>
    </PureGlobal>
  );
});

render(<AdminLayoutExample />);

```

- 自定义用户登录布局
- AfterCustomUserLoginLayout 组件支持自定义用户信息 API，适用于自定义用户系统
- _Authenticate(@components/Authenticate),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { AfterCustomUserLoginLayout } = _Authenticate;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Typography, Card } = antd;

const { Title, Paragraph } = Typography;

const CustomUserExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [PureGlobal, usePreset] = remoteModules;
  
  const InnerComponent = () => {
    const { apis } = usePreset();
    
    return (
      <AfterCustomUserLoginLayout 
        title="自定义用户中心" 
        api={apis.user.getUserInfo}
        navigation={{ isFixed: false }}
      >
        <Card>
          <Title level={4}>自定义用户系统</Title>
          <Paragraph>
            这是使用自定义 API 获取用户信息的布局示例。可以灵活配置用户信息接口。
          </Paragraph>
        </Card>
      </AfterCustomUserLoginLayout>
    );
  };
  
  return (
    <PureGlobal preset={mockPreset}>
      <InnerComponent />
    </PureGlobal>
  );
});

render(<CustomUserExample />);

```

### API

## Authenticate 组件

用户权限和用户信息管理组件，提供用户信息获取、登录后布局、用户信息编辑等功能。

### 主要组件

#### UserInfo

获取普通用户信息的组件，自动从 API 加载用户信息并设置到全局上下文中。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 基础路由路径，用于账户状态检查时的跳转 | string | '/account' |
| cache | 缓存键名 | string | 'user-info' |
| children | 子组件 | ReactNode | - |

#### SuperAdminInfo

获取超级管理员信息的组件。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 子组件 | ReactNode | - |

#### CustomUserInfo

自定义用户信息获取组件，支持自定义 API。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 基础路由路径 | string | - |
| cache | 缓存键名 | string | - |
| api | 自定义 API 配置 | object | - |
| children | 子组件 | ReactNode | - |

### 布局组件

#### AfterUserLoginLayout

用户登录后的布局组件，包含顶部导航栏和用户工具。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 基础路由路径 | string | '/account' |
| navigation | 导航配置 | object | - |
| title | 页面标题 | string | - |
| children | 子组件 | ReactNode | - |

#### AfterUserLogin

用户登录后的简单包装组件，不包含布局。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 基础路由路径 | string | '/account' |
| children | 子组件 | ReactNode | - |

#### AfterAdminUserLoginLayout

管理员登录后的布局组件。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| navigation | 导航配置 | object | - |
| title | 页面标题 | string | - |
| children | 子组件 | ReactNode | - |

#### AfterCustomUserLoginLayout

自定义用户登录后的布局组件。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 基础路由路径 | string | '/account' |
| api | 自定义用户信息 API | object | - |
| navigation | 导航配置 | object | - |
| title | 页面标题 | string | - |
| children | 子组件 | ReactNode | - |

#### AfterCustomUserLogin

自定义用户登录后的简单包装组件。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 基础路由路径 | string | '/account' |
| api | 自定义用户信息 API | object | - |
| children | 子组件 | ReactNode | - |

#### BeforeLoginLayout

登录前的布局组件。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 子组件 | ReactNode | - |

#### MainLayout

主布局组件。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| navigation | 导航配置 | object | - |
| title | 页面标题 | string | - |
| children | 子组件 | ReactNode | - |

### 用户信息组件

#### SaveUserInfo

保存用户信息的组件，通过点击事件触发表单弹窗。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 渲染函数，接收 { onClick } 参数 | (props) => ReactNode | - |

**使用示例**：
```jsx
<SaveUserInfo>
  {({ onClick }) => (
    <Button onClick={onClick}>编辑用户信息</Button>
  )}
</SaveUserInfo>
```

#### UserInfoFormInner

用户信息表单内部组件。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| column | 表单列数 | number | 1 |

**表单字段**：
- `avatar` - 用户头像
- `email` - 邮箱（必填）
- `nickname` - 昵称
- `description` - 描述

#### RightOptions

右侧工具栏组件，显示语言切换和用户工具。

### 数据结构

#### UserInfo 数据结构

| 字段名 | 说明 | 类型 | 示例 |
| --- | --- | --- | --- |
| id | 用户ID | number | 1 |
| email | 邮箱 | string | "zhangsan@example.com" |
| nickname | 昵称 | string | "张三" |
| avatar | 头像URL | string | "https://api.dicebear.com/7.x/avataaars/svg?seed=xxx" |
| phone | 手机号 | string | "+86138001380001" |
| description | 描述 | string | "资深前端工程师" |
| status | 状态 | number | 0-正常, 1-待完善 |
| gender | 性别 | string | "M"-男, "F"-女 |
| isSuperAdmin | 是否超级管理员 | boolean | true |

### 账户状态说明

| 状态值 | 说明 | 行为 |
| --- | --- | --- |
| 0 | 正常 | 正常显示内容 |
| 1 | 待完善信息 | 自动跳转到信息完善页面 |

### 依赖组件

- `@kne/remote-loader` - 远程组件加载器
- `components-core:Layout` - 布局组件
- `components-core:Global@SetGlobal` - 全局状态设置
- `components-core:Global@usePreset` - 全局预设
- `components-core:FormInfo` - 表单组件
- `@components/UserTool` - 用户工具组件
- `@components/Account/Language` - 语言切换组件

### 国际化支持

组件支持中英文切换：

- `zh-CN` - 中文简体
- `en-US` - 英文

### API 接口

| 接口名 | 说明 | 方法 |
| --- | --- | --- |
| user.getUserInfo | 获取用户信息 | GET |
| user.saveUserInfo | 保存用户信息 | POST |
| admin.getSuperAdminInfo | 获取超级管理员信息 | GET |
