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
| appendTabDetails | 追加租户详情 Tab | array | - |
| appendSettingMenus | 追加「设置」左菜单项（`{ key, label, component, index? }`） | array | - |
