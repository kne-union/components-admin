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
          <Route path="/detail" element={<TabDetail optionFixed={false} />} />
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
|  ---  | ---  | --- | --- |
