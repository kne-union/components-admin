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
| platform | 平台管理 | 本包 `PlatformManagement`（左栏：认证管理 / 平台关联 / MCP） | 始终；「平台关联」受 `setting.appOpsEnabled`；「MCP」受 `setting.mcpEnabled` |

平台管理路由：`{baseUrl}/platform/oidc/*`（原 OidcAdmin 子页）、`{baseUrl}/platform/link/*`（`components-app-manager:PlatformLink`）、`{baseUrl}/platform/mcp`（开放能力 / allowlist）、`{baseUrl}/platform/mcp/keys`（当前用户 MCP 密钥，可被业务客户端复用）。认证管理、MCP 下的子项为二级。`PlatformManagement` 可传 `mcpServerName`（默认 `mcp`）用于安装配置里的 server 名。

依赖：`getSuperAdminInfo` 返回 `{ userInfo, setting }`（`@kne/fastify-account` ≥ 2.0.13 + 宿主 `getAdminSetting` / `adminSetting`）。宿主示例：

```js
getAdminSetting: ({ fastify }) => ({
  appOpsEnabled: !!fastify.config.APP_OPS_ENABLED,
  mcpEnabled: !!fastify.mcp // 已注册 @kne/fastify-mcp（默认 name=mcp）
})
```

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
