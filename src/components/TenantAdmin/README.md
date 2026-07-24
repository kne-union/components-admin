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

### API

|属性名|说明|类型|默认值|
| --- | --- | --- | --- |
| showLanguageSetting | 是否在租户设置左菜单中显示「语言设置」；也可通过 `plugins.admin.tenant.showLanguageSetting` 配置 | boolean | `false` |
| languageOptionsApi | 可选语言列表接口；不传时使用 `apis.intlAdmin.langType.list`；也可通过 `plugins.admin.tenant.languageOptionsApi` 配置 | object | `apis.intlAdmin.langType.list` |
| showBuiltinLanguageOptions | 是否追加内置中文/英文选项；也可通过 `plugins.admin.tenant.showBuiltinLanguageOptions` 配置 | boolean | `false` |

### plugins.admin.tenant

|字段|说明|类型|默认值|
| --- | --- | --- | --- |
| showLanguageSetting | 开启语言设置菜单 | boolean | `false` |
| languageOptionsApi | 自定义语言列表 API（与 Fetch 兼容） | object | - |
| showBuiltinLanguageOptions | 显示内置中文/英文 | boolean | `false` |
| appendTabDetails | 追加租户详情 Tab | array | - |
