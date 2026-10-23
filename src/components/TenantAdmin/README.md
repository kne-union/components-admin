# TenantAdmin

### 概述

租户管理


### 示例(全屏)

#### 示例代码

- 租户列表
- 租户列表页面，支持状态筛选、关键字搜索、添加租户、编辑、开启/关闭、删除等操作
- _TenantAdmin(@components/TenantAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { List } = _TenantAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Routes, Route } = reactRouterDom;

const ListExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <List />
      </Layout>
    </PureGlobal>
  );
});

render(<ListExample />);

```

- 表单字段
- 租户表单字段组件，包含租户名称、账号数量、服务时间、Logo、主题色、描述等字段
- _TenantAdmin(@components/TenantAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { FormInner } = _TenantAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card } = antd;

const FormInnerExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo@Form', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [Form, PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Card title="租户表单字段">
        <Form onSubmit={(data) => console.log(data)}>
          <FormInner />
        </Form>
      </Card>
    </PureGlobal>
  );
});

render(<FormInnerExample />);

```

- Tab详情页
- 带Tab切换的租户详情页，包含公司信息、组织架构、权限、用户列表、设置等Tab页
- _TenantAdmin(@components/TenantAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { TabDetail } = _TenantAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Routes, Route, Navigate } = reactRouterDom;

const TabDetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path="/detail" element={<TabDetail optionFixed={false} showLanguageSetting />} />
          <Route path="*" element={<Navigate to="/detail?id=tenant-001" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<TabDetailExample />);

```

- 宿主同步租户详情
- 宿主同步的租户带「宿主同步」标签，隐藏编辑 / 开启关闭 / 删除，组织、用户、权限页签只读；同时演示通过 plugins.admin.tenant.appendTabDetails 挂载 OidcAdmin 的 TenantApps「子应用」页签。
- _TenantAdmin(@components/TenantAdmin),_OidcAdmin(@components/OidcAdmin),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { TabDetail } = _TenantAdmin;
const { TenantApps } = _OidcAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Routes, Route, Navigate } = reactRouterDom;

const preset = Object.assign({}, mockPreset, {
  plugins: Object.assign({}, mockPreset.plugins, {
    admin: { tenant: { appendTabDetails: [{ tab: '子应用', key: 'apps', component: TenantApps, index: 3 }] } }
  })
});

const ManagedDetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={preset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path="/managed-detail" element={<TabDetail optionFixed={false} />} />
          <Route path="*" element={<Navigate to="/managed-detail?id=tenant-host-001" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<ManagedDetailExample />);

```

### API

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
