# Admin

### 概述

超管后台的入口组件：初始化系统、管超级管理员账号，以及用 `AdminLayout` 搭一整套通用后台壳。业务只要把自己的菜单和页面挂上去，用户、文件、消息、平台管理这些公共能力已经内置好了。

**核心特性**

- **AdminLayout 统一壳**：顶栏内置用户 / 文件 / 消息 / 平台管理；平台管理左栏是「认证管理」（原 OIDC 菜单作二级）和「平台关联」（需开启 `appOpsEnabled`）
- **业务只追加自己的模块**：任务、租户等用 `navigation.list` + `list` 挂上即可，不必再手写公共导航和路由
- **系统初始化 InitAdmin**：首次部署时引导创建超级管理员，完成后自动进入后台
- **用户管理**：列表、加用户、改资料与密码、设超管、启停账号，走统一账号接口

**适用场景**

- 各业务系统的超级管理后台（onboarding、主平台、独立后台都可复用同一套壳）
- 需要统一登录认证运维、文件与消息能力的管理端
- 多应用平台关联、OIDC 客户端与会话管理要跟后台壳绑在一起时

**技术亮点**

- 导航项可按 `getSuperAdminInfo` 下发的 `setting` 显隐（例如平台关联依赖 `appOpsEnabled`）
- 与 `AfterAdminUserLoginLayout` 配套：登录态、顶栏、业务页一层布局，避免再套一层 Layout


### 示例(全屏)

#### 示例代码

- 通用后台布局
- 任务、租户用本包 Task / TenantAdmin 挂上；用户、文件、消息、平台管理由布局内置。点「平台管理」可见左栏「认证管理」（二级 OIDC）与「平台关联」（需 setting.appOpsEnabled）
- _Admin(@components/Admin),_Task(@components/Task),_TenantAdmin(@components/TenantAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { AdminLayout } = _Admin;
const { default: Task } = _Task;
const { default: TenantAdmin } = _TenantAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/Admin/admin-layout';
const pageProps = { menuFixed: false };

const AdminLayoutExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Routes>
        <Route
          path={&#96;${baseUrl}/*&#96;}
          element={
            <AdminLayout
              baseUrl={baseUrl}
              defaultTitle="Demo Admin"
              indexPath="user"
              pageProps={pageProps}
              navigation={{
                isFixed: false,
                // 示例预览宽度有限，去掉右侧语言/头像，避免导航项全部挤进「更多」
                rightOptions: null,
                list: [
                  {
                    key: 'task',
                    title: '任务管理',
                    path: &#96;${baseUrl}/task&#96;
                  },
                  {
                    key: 'tenant',
                    title: '租户管理',
                    path: &#96;${baseUrl}/tenant&#96;
                  }
                ]
              }}
              list={[
                {
                  path: 'task/*',
                  element: <Task baseUrl={baseUrl} pageProps={pageProps} />
                },
                {
                  path: 'tenant/*',
                  element: <TenantAdmin baseUrl={baseUrl} pageProps={pageProps} />
                }
              ]}
            />
          }
        />
        <Route path="*" element={<Navigate to={&#96;${baseUrl}/user&#96;} replace />} />
      </Routes>
    </PureGlobal>
  );
});

render(<AdminLayoutExample />);

```

- 基础用法
- Admin 组件的完整功能展示，包含用户管理子路由和路由导航功能
- _Admin(@components/Admin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom),antd(antd)

```jsx
const { default: Admin } = _Admin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate, useNavigate, Button, Flex } = { ...reactRouterDom, ...antd };

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const navigate = useNavigate();
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route
            path="/Admin/admin/*"
            element={
              <Admin
                baseUrl="/Admin/admin"
                pageProps={{
                  menuFixed: false
                }}
              />
            }
          />
          <Route path="*" element={<Navigate to="/Admin/admin/user" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 用户管理
- 单独展示 User 子组件，包含用户列表、添加用户、编辑用户、修改密码、设置超级管理员等完整功能
- _Admin(@components/Admin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { default: Admin } = _Admin;
const { User } = Admin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const UserExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <User pageProps={{ menuFixed: false }} />
      </Layout>
    </PureGlobal>
  );
});

render(<UserExample />);

```

- 初始化超级管理员
- InitAdmin 组件用于系统首次使用时初始化超级管理员账号，初始化成功后自动跳转到管理后台
- _Admin(@components/Admin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { InitAdmin } = _Admin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const InitAdminExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <InitAdmin baseUrl="/Admin/admin" />
      </Layout>
    </PureGlobal>
  );
});

render(<InitAdminExample />);

```

### API

## Admin 组件

管理后台组件，提供用户管理和系统初始化功能。包含路由管理和上下文管理。另提供 `AdminLayout`：封装各应用共用的超管导航与路由，业务只追加自定义模块。

### 主组件属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 管理后台的基础路由路径 | string | - |
| ...props | 其他属性会通过 Context 传递给子组件 | object | - |

### 子组件

#### AdminLayout 统一超管壳

`components-admin:Admin@AdminLayout`。内置导航与路由（追加在自定义项之后）：

| key | 说明 | 远程模块 / 实现 | 显隐 |
| --- | --- | --- | --- |
| user | 用户管理 | 本包 `Admin.User` | 始终 |
| file | 文件管理 | `components-file-manager:FileListPage` | 始终 |
| message | 消息管理 | `components-admin:MessageManger` | 始终 |
| platform | 平台管理 | 本包 `PlatformManagement`（左栏：认证管理 / 平台关联） | 始终；其中「平台关联」左菜单受 `userInfo.setting.appOpsEnabled` 控制 |

平台管理路由：`{baseUrl}/platform/oidc/*`（原 OidcAdmin 子页）、`{baseUrl}/platform/link/*`（`components-app-manager:PlatformLink`）。认证管理下的原 Oidc 菜单项为二级。

依赖：`getSuperAdminInfo` 返回 `{ userInfo, setting }`（`@kne/fastify-account` ≥ 2.0.13 + 宿主 `getAdminSetting`）。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 管理后台基础路径 | string | `/admin` |
| defaultTitle | 顶栏默认标题 | string | - |
| indexPath | 访问 `baseUrl` 时重定向的相对路径 | string | `user` |
| navigation | 传给布局的 navigation；`list` 仅为**业务自定义**项，内置项自动追加 | object | - |
| list | 业务自定义路由（`AppChildrenRouter` 的 list），内置路由自动追加 | array | `[]` |
| pageProps | 传给用户管理等内置页的 pageProps | object | - |
| children | 可选 catch-all | ReactNode | - |

```jsx
<RemoteLoader
  module="components-admin:Admin@AdminLayout"
  baseUrl="/admin"
  defaultTitle="AI Onboarding"
  indexPath="tenant"
  navigation={{
    list: [
      { key: 'task', title: '任务管理', path: '/admin/task' },
      { key: 'tenant', title: '租户管理', path: '/admin/tenant' }
    ]
  }}
  list={[
    { path: 'task/*', element: <RemoteLoader module="components-admin:Task" baseUrl="/admin" /> },
    { path: 'tenant/*', element: <RemoteLoader module="components-admin:TenantAdmin" baseUrl="/admin" /> }
  ]}
/>
```

外层仍由业务包 `OidcAuthenticate` / 登录守卫；不必再手写用户/文件/消息/平台管理的导航与路由。

#### User 用户管理组件

用户管理页面，提供用户列表展示、添加用户、编辑用户、修改密码、设置超级管理员、设置状态等功能。

**数据结构**

| 字段名 | 说明 | 类型 | 示例 |
| --- | --- | --- | --- |
| id | 用户ID | number | 1 |
| avatar | 用户头像URL | string | "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan" |
| nickname | 用户昵称 | string | "张三" |
| email | 用户邮箱 | string | "zhangsan@example.com" |
| phone | 用户手机号 | string | "+86138001380001" |
| isSuperAdmin | 是否为超级管理员 | boolean | true |
| status | 用户状态 | number | 0-正常, 10-未激活, 11-禁用, 12-关闭 |
| description | 用户描述 | string | "系统超级管理员" |
| gender | 性别 | string | "M"-男, "F"-女 |

**状态说明**

| 状态值 | 说明 | 颜色 |
| --- | --- | --- |
| 0 | 正常 | success（绿色） |
| 10 | 未激活 | default（灰色） |
| 11 | 禁用 | danger（红色） |
| 12 | 关闭 | danger（红色） |

**功能列表**

- 添加用户：创建新用户账号
- 编辑用户：修改用户信息
- 修改密码：重置用户密码
- 设置超级管理员：设置/取消用户的超级管理员权限
- 设置正常：将用户状态设置为正常
- 关闭用户：关闭用户账号

**筛选功能**

- 邮箱筛选：按邮箱地址筛选
- 手机号筛选：按手机号筛选
- 状态筛选：按用户状态筛选
- 管理员筛选：按是否为超级管理员筛选

**搜索功能**

- 昵称搜索：按用户昵称搜索

#### InitAdmin 初始化超级管理员组件

系统初始化组件，用于首次使用时初始化超级管理员账号。

**功能说明**

- 自动调用初始化接口创建超级管理员
- 初始化成功后自动跳转到管理后台首页
- 显示初始化进行中的提示信息

### Context API

Admin 组件提供了 Context 用于在子组件中访问共享数据：

#### useBaseUrl

获取管理后台的基础路由路径。

```javascript
import { useBaseUrl } from '@components/Admin';

const MyComponent = () => {
  const baseUrl = useBaseUrl();
  // 使用 baseUrl...
};
```

#### useProps

获取 Admin 组件传递的所有属性。

```javascript
import { useProps } from '@components/Admin';

const MyComponent = () => {
  const props = useProps();
  // props 包含 baseUrl 和其他传入的属性
};
```

### 依赖组件

- `@kne/remote-loader` - 远程组件加载器
- `components-core:Layout@TablePage` - 表格页面布局
- `components-core:Filter` - 筛选组件
- `components-core:FormInfo` - 表单组件
- `components-core:Global@usePreset` - 全局预设

### 国际化支持

组件支持中英文切换，通过 `@kne/react-intl` 实现：

- `zh-CN` - 中文简体
- `en-US` - 英文

### API 接口

| 接口名 | 说明 | 方法 |
| --- | --- | --- |
| admin.getUserList | 获取用户列表 | GET |
| admin.addUser | 添加用户 | POST |
| admin.saveUser | 保存用户信息 | POST |
| admin.resetUserPassword | 重置用户密码 | POST |
| admin.setSuperAdmin | 设置超级管理员 | POST |
| admin.setUserNormal | 设置用户正常 | POST |
| admin.setUserClose | 关闭用户 | POST |
| admin.getSuperAdminInfo | 获取超级管理员信息 | GET |
| admin.initSuperAdmin | 初始化超级管理员 | POST |
