|属性名|说明|类型|默认值|
| --- | --- | --- | --- |
| showLanguageSetting | 是否在租户设置左菜单中显示「语言设置」；也可通过 `plugins.admin.tenant.showLanguageSetting` 配置 | boolean | `false` |
| languageOptionsApi | 可选语言列表接口；不传时使用 `apis.intlAdmin.langType.list`；也可通过 `plugins.admin.tenant.languageOptionsApi` 配置 | object | `apis.intlAdmin.langType.list` |
| showBuiltinLanguageOptions | 是否追加内置中文/英文选项；也可通过 `plugins.admin.tenant.showBuiltinLanguageOptions` 配置 | boolean | `false` |
| appendSettingMenus | 追加「设置」左菜单项；也可通过 `plugins.admin.tenant.appendSettingMenus` 配置 | array | - |

### plugins.admin.tenant

|字段|说明|类型|默认值|
| --- | --- | --- | --- |
| showLanguageSetting | 开启语言设置菜单 | boolean | `false` |
| languageOptionsApi | 自定义语言列表 API（与 Fetch 兼容） | object | - |
| showBuiltinLanguageOptions | 显示内置中文/英文 | boolean | `false` |
| appendTabDetails | 追加租户详情 Tab（`{ tab, key, component, index? }`，`component` 接收 `tenant`、`reload`），如挂载 `OidcAdmin` 的 `TenantApps` 作为「子应用」页签 | array | - |
| appendSettingMenus | 追加「设置」左菜单项（`{ key, label, component, index? }`） | array | - |

### 宿主同步的托管租户

子应用以 fastify-oidc `independent` 模式接入时，宿主同步的租户带 `options.managedBy.hostTenantId` 标记（判断方法见 Tenant 的 `isManagedTenant`）。TenantAdmin 中：

- 列表「来源」列显示「宿主同步」/「本地」，详情页头部追加「宿主同步」标签
- 隐藏编辑、开启 / 关闭、删除
- 组织架构、用户列表、权限页签只读（顶部提示到宿主修改），设置中不显示「语言设置」；公司信息、环境变量、自定义组件与共享组仍可编辑
