## Tenant 组件

租户管理系统组件，提供完整的租户管理功能，包括公司信息管理、组织架构管理、用户管理、角色权限管理等。

## 主组件 Tenant

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 路由基础路径 | string | - |
| navigation | 导航配置 | object | {} |
| list | 自定义路由配置 | array | [] |
| children | 子元素 | ReactNode | - |

## 子组件

### CompanyInfo 公司信息

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 公司数据 | object | - |
| onSubmit | 提交回调 | function | - |
| hasEdit | 是否显示编辑按钮 | boolean | true |
| apis | API 配置 | object | - |

### OrgInfo 组织架构

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 组织列表数据 | array | [] |
| companyName | 公司名称 | string | - |
| tenantId | 租户 ID（管理端 `tenantAdmin` 场景传入，用于批量导入等接口 body） | string | - |
| apis | API 配置（含 create、save、remove、userList、import 等） | object | - |
| onSuccess | 操作成功回调 | function | - |

### UserList 用户列表

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API 配置 | object | - |
| topOptionsSize | 顶部操作按钮尺寸 | string | - |
| onMount | 挂载回调 | function | - |
| children | 自定义渲染 | function | - |

### Role 角色管理

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API 配置 | object | - |
| readOnly | 只读：「管理权限」变为「查看权限」并以只读方式打开权限树；增删改按钮由是否传入对应 `apis` 决定 | boolean | false |

角色列表 `apis.list` 支持 `params.filter`：

| 字段 | 说明 |
| --- | --- |
| keyword | 名称/编码/描述模糊搜索 |
| type | 角色类型：`system` / `custom` |
| status | 状态：`open` / `closed` |

### Permission 权限管理

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API 配置 | object | - |
| readOnly | 只读：租户权限树不可勾选，角色只保留列表与查看权限（共享组不受影响） | boolean | false |
| children | 自定义渲染 | function | - |

### PermissionPanel 权限树

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| settings | 权限树 `{ modules }` | object | - |
| value / defaultValue / onChange | 已选权限 code（受控 / 非受控） | string[] | - |
| disabled | 只读：禁用勾选并隐藏「全选」 | boolean | false |

### 宿主同步的托管租户

子应用以 fastify-oidc `independent` 模式接入宿主时，宿主同步过来的租户在 `tenant.options.managedBy.hostTenantId` 上有标记，其基本信息、成员、角色、权限与组织架构均以宿主为准，后端拒绝本地修改。前端相应只读：

- `isManagedTenant(tenant)`：判断是否托管租户
- `Setting` 的组织架构、用户管理、权限管理（角色）页隐藏新建 / 编辑 / 删除 / 导入 / 组织关联，顶部提示「该租户由宿主系统同步管理，请在宿主中修改」；公司信息与共享组仍可编辑
- 当前租户取自 `useGlobalContext('userInfo').global.tenant`

### LoginTenant 租户登录

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| tenantPath | 登录成功跳转路径 | string | - |
| embedded | 嵌入宿主 Page（如 `@kne/system-layout`）时只渲染标题与租户列表，不带登录页外壳 | boolean | false |
| systemName | 登录页外壳左上角的系统名称 | string | - |
| systemLogo | 登录页外壳左上角的系统 Logo | string \| ReactNode | - |
| children | 自定义渲染，参数为 `{ children, backgroundColor }` | function | - |

默认使用与登录页相同的 Layout（`Account` 的 `LoginOuterContainer`），不带系统主导航。样式与 `Oidc` 交互页的选择租户一致，点击租户即进入 `tenantPath`。点击的不是当前租户时：preset 中存在 `oidc`（`components-admin:Oidc` 的 `createOidcClient`）则调用 `oidc.switchTenant` 重新签发令牌（托管租户除外）；否则先调用切换默认租户接口。

### JoinInvitation 邀请加入

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 基础路径 | string | '' |
| token | 邀请 token，不传时取 URL 的 `token` 参数 | string | - |
| systemName | 登录页外壳左上角的系统名称 | string | - |
| systemLogo | 登录页外壳左上角的系统 Logo | string \| ReactNode | - |
| children | 自定义渲染 | function | - |

流程分三步：确认公司信息（公司摘要：Logo、名称、标签、行业、规模、成立日期、地址、主页、简介）→ 确认员工信息 → 完成后倒计时进入 `${baseUrl}/tenant`。

### Setting 系统设置

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API 配置 | object | - |
| baseUrl | 基础路径 | string | - |

`Setting` 内含「消息设置」页（路由 `mail`，菜单权限 `setting:mail-setting`）。按子模块控制：「SMTP 设置」查看 / 编辑需 `setting:mail-setting:smtp:view` / `setting:mail-setting:smtp:edit`，「消息模版」查看 / 编辑需 `setting:mail-setting:template:view` / `setting:mail-setting:template:edit`；不分子模块的 `setting:mail-setting:view` / `setting:mail-setting:edit` 同时作用于两个页签。没有查看权限的页签不显示。

### MailSetting 消息设置

租户 SMTP 配置与消息模版（邮件 / 短信）自定义，分「SMTP 设置」「消息模版」两个 Tab。租户端在 `Setting` 中使用，管理端在 `TenantAdmin` 详情「设置 → 消息设置」中使用。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | 消息设置接口：租户端 `apis.tenant.mailSetting`，管理端 `apis.tenantAdmin.mailSetting` | object | - |
| tenantId | 管理端操作的租户 id，传入后所有请求带上 `tenantId` | string | - |
| hasEdit | 是否可编辑；为 `false` 时只能查看与预览 | boolean | true |
| permissions | 按子模块控制：`{ smtp: { view, edit }, template: { view, edit } }`，`view` 为 `false` 的页签不显示；未传的项 `view` 默认 `true`、`edit` 取 `hasEdit` | object | - |
| editableTypes | 可自定义的模版类型，`0` 邮件、`1` 短信；不在其中的类型只能预览（如 `[0]` 只开放邮件模版编辑） | number[] | [0, 1] |
| renderFooter | 自定义 SMTP 表单操作按钮（测试连接、保存、取消）的容器，如 `actions => <Page.Footer>{actions}</Page.Footer>` 放到 system-layout 页面底栏；不传时按钮居中显示在表单下方 | (actions: ReactNode) => ReactNode | - |

- SMTP：未配置或停用时本租户邮件使用系统默认发件服务；密码留空表示不修改，可用「测试连接」校验连接或发送测试邮件
- 消息模版：列出可自定义的系统邮件与短信模版（租户端只列出平台在「消息管理 → 消息模版」中开放给租户的模版），「自定义」以系统模版为底稿编辑（邮件改主题与正文，短信改内容），保存后成为本租户模版，可启用/禁用、恢复默认、预览；工具栏可按名称 / 编码搜索、按类型筛选；模版相关请求均带 `type`
- `MailSetting.SmtpSetting`、`MailSetting.TemplateList` 可单独使用，属性同上

`apis.*.mailSetting` 包含：`smtpDetail`、`smtpSave`、`smtpRemove`、`smtpTest`、`templateList`、`templateDetail`、`templateCustomize`、`templateSave`、`templateSetStatus`、`templateReset`、`templatePreview`，对应 `@kne/fastify-tenant` 的 `/mail-setting/*` 与 `/admin/mail-setting/*` 接口；管理端（`apis.tenantAdmin.mailSetting`）另有 `templateSetTenantOpen`，模版列表据此显示「租户端管理」列与「开放给租户 / 关闭租户管理」操作，只对当前租户生效。

### MfaSetting MFA 设置

租户统一登录（OIDC）的短信 MFA 配置：是否开启、验证有效期。开启后成员经统一登录进入本租户需完成短信验证，未绑定手机号的账号无法进入。租户端在 `Setting` 中使用（路由 `mfa`，菜单权限 `setting:mfa-setting`，查看 / 编辑需 `setting:mfa-setting:view` / `setting:mfa-setting:edit`），管理端在 `TenantAdmin` 详情「设置 → MFA 设置」中使用。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | MFA 设置接口：租户端 `apis.tenant.mfaSetting`，管理端 `apis.tenantAdmin.mfaSetting` | object | - |
| tenantId | 管理端操作的租户 id，传入后所有请求带上 `tenantId` | string | - |
| hasEdit | 是否可编辑；为 `false` 时只能查看 | boolean | true |
| renderFooter | 自定义编辑表单操作按钮（保存、取消）的容器 | (actions: ReactNode) => ReactNode | - |

- 验证有效期：表单以分钟填写，提交时换算为秒（`maxAge`）；同一登录会话内，验证通过后在有效期内再次进入本租户无需重复验证，`0` 表示每次进入都需验证；默认 1 天
- 验证方式目前固定为短信（`methods: ['sms']`）

`apis.*.mfaSetting` 包含：`detail`、`save`，对应 `@kne/fastify-tenant` 的 `/mfa-setting/*` 与 `/admin/mfa-setting/*` 接口。

### TenantUserSelect 按组织选择租户用户

参考 `UserSelect`，用于在表单中先选组织、再选租户成员。左侧为组织树，右侧为成员列表（支持滚动加载），成员列表按所选组织及其子组织过滤（`filter.tenantOrgId`）。

默认形态为表单内常驻双栏面板；另提供 `TenantUserSelect.Input`（基于 `@kne/super-select` 的 `SelectInput`）以下拉或弹窗完成选择。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 表单字段名称 | string | - |
| label | 表单标签 | string | - |
| rule | 校验规则，如 `REQ` | string | - |
| placeholder | 成员选择占位文本 | string | - |
| single | 是否单选 | boolean | true |
| disabled | 是否禁用 | boolean | false |
| disabledIds | 不可选中的成员 id 列表（仍展示，置灰不可点选） | array | - |
| disabledLabel | 禁用成员右侧的原因标签：字符串 / ReactNode 全部共用，或 `(item) => label` 按成员返回；返回空值用默认文案「不可选」，返回 `false` 不显示标签 | string \| ReactNode \| function | - |
| showSelectedFooter | 是否在底部展示已选成员，支持点击标签移除 | boolean | true |
| allowSelectAll | 多选时是否展示全选 | boolean | true |
| userStatus | 成员状态筛选：`open` / `closed`（兼容 `active` → `open`、`inactive` → `closed`） | string | - |
| companyName | 组织树根节点（公司）名称 | string | - |
| showOrgRoot | 是否展示公司根节点 | boolean | true |
| height | 面板高度 | number \| string | 面板版默认自适应；Input 版默认 `480` |
| valueKey | 选中值唯一字段 | string | `'id'` |
| labelKey | 选中值展示字段 | string | `'name'` |
| orgApi | 自定义组织列表 API，默认 `apis.tenant.orgList` | object | - |
| userApi | 自定义成员列表 API，默认 `apis.tenant.userList` | object | - |

#### 子组件

| 导出 | 说明 |
| --- | --- |
| `TenantUserSelect` | 表单字段（`useDecorator`），常驻双栏面板 |
| `TenantUserSelect.Field` | 面板纯控件（`value` / `onChange`） |
| `TenantUserSelect.Input` | 表单字段（`useOnChange`），`SelectInput` 下拉/弹窗 |
| `TenantUserSelect.Input.Field` | SelectInput 纯控件（`value` / `onChange`） |

#### TenantUserSelect.Input 额外属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| isPopup | `true` 下拉，`false` 弹窗 | boolean | true |
| overlayWidth | 下拉/弹层面板宽度 | number \| string | `720` |

```jsx
// 表单：下拉
<TenantUserSelect.Input name="owner" label="负责人" rule="REQ" isPopup companyName="示例公司" />

// 表单：弹窗多选
<TenantUserSelect.Input name="members" label="成员" single={false} isPopup={false} />

// 非表单受控
<TenantUserSelect.Input.Field value={value} onChange={setValue} isPopup />
```

## API 配置说明

```javascript
const apis = {
  tenant: {
    // 用户相关
    getUserInfo: { /* 获取当前用户信息 */ },
    getOrgList: { /* 获取组织列表 */ },
    saveOrg: { /* 保存组织 */ },
    createOrg: { /* 创建组织 */ },
    removeOrg: { /* 删除组织 */ },
    getUserList: { /* 获取用户列表 */ },
    createUser: { /* 创建用户 */ },
    saveUser: { /* 保存用户 */ },
    removeUser: { /* 删除用户 */ },
    // 角色相关
    getRoleList: { /* 获取角色列表 */ },
    createRole: { /* 创建角色 */ },
    saveRole: { /* 保存角色 */ },
    removeRole: { /* 删除角色 */ },
    permissionSave: { /* 保存角色权限 */ },
    // 租户相关
    getTenantList: { /* 获取租户列表 */ },
    getPermissionList: { /* 获取权限列表 */ },
    savePermission: { /* 保存权限 */ },
    // 邀请相关
    parseJoinToken: { /* 解析邀请令牌 */ },
    join: { /* 加入租户 */ }
  }
};
```

## 依赖模块

- `components-core:FormInfo` - 表单组件
- `components-core:Layout` - 布局组件
- `components-core:Global@usePreset` - 全局配置
- `components-admin:Authenticate@AfterUserLoginLayout` - 用户登录后布局
