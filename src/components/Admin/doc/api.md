## Admin 组件

管理后台组件，提供用户管理和系统初始化功能。包含路由管理和上下文管理。

### 主组件属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 管理后台的基础路由路径 | string | - |
| ...props | 其他属性会通过 Context 传递给子组件 | object | - |

### 子组件

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
