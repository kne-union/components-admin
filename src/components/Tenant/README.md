# Tenant

### 概述

租户管理系统组件，提供公司信息管理、组织架构管理、用户管理、角色权限管理等完整的租户管理功能。子组件 `TenantUserSelect` 支持按组织树筛选并选择租户成员，适用于负责人指定、协作成员选择等表单场景。


### 示例(全屏)

#### 示例代码

- 公司信息
- CompanyInfo 组件用于展示和编辑公司基本信息，包括公司简介、发展历程、团队介绍等
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { CompanyInfo } = _Tenant;
const { default: mockPreset, tenantData } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const CompanyInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <CompanyInfo
          data={tenantData.company}
          hasEdit={true}
          apis={{
            save: { loader: () => ({ code: 0 }) }
          }}
          onSubmit={(data) => {
            console.log('保存公司信息:', data);
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<CompanyInfoExample />);

```

- 组织架构
- OrgInfo 组件用于管理组织架构；示例与 TenantAdmin 详情内「组织架构」Tab 一致（Fetch + tenantAdmin orgList 与完整 apis）
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactFetch(@kne/react-fetch)

```jsx
const { OrgInfo } = _Tenant;
const { default: mockPreset, tenantAdminData } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const Fetch = reactFetch.default;

const OrgInfoInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const tenant = tenantAdminData.tenantDetail;
  return (
    <Fetch
      {...Object.assign({}, apis.tenantAdmin.orgList, {
        params: {
          tenantId: tenant.id
        }
      })}
      render={({ data, reload }) => {
        return (
          <OrgInfo
            data={data}
            tenantId={tenant.id}
            companyName={tenant?.tenantCompany?.name}
            onSuccess={reload}
            apis={{
              create: Object.assign({}, apis.tenantAdmin.orgCreate, {
                data: { tenantId: tenant.id }
              }),
              save: Object.assign({}, apis.tenantAdmin.orgSave, {
                data: { tenantId: tenant.id }
              }),
              remove: Object.assign({}, apis.tenantAdmin.orgRemove, {
                data: { tenantId: tenant.id }
              }),
              userList: Object.assign({}, apis.tenantAdmin.userList, {
                params: { tenantId: tenant.id }
              }),
              import: apis.tenantAdmin.orgBatchImport
            }}
          />
        );
      }}
    />
  );
});

const OrgInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <OrgInfoInner />
      </Layout>
    </PureGlobal>
  );
});

render(<OrgInfoExample />);

```

- 用户列表
- UserList 组件用于管理租户用户，支持搜索、添加、编辑、删除用户
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { UserList } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const UserListExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <UserList
          apis={{
            list: mockPreset.apis.tenant.getUserList,
            create: mockPreset.apis.tenant.createUser,
            save: mockPreset.apis.tenant.saveUser,
            remove: mockPreset.apis.tenant.removeUser
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<UserListExample />);

```

- 角色管理
- Role 组件用于管理角色，支持添加、编辑、删除角色，并可为角色分配权限
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { Role } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const RoleExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Role
          apis={{
            list: mockPreset.apis.tenant.getRoleList,
            create: mockPreset.apis.tenant.createRole,
            save: mockPreset.apis.tenant.saveRole,
            remove: mockPreset.apis.tenant.removeRole,
            permissionSave: mockPreset.apis.tenant.savePermission,
            permissionList: mockPreset.apis.tenant.getPermissionList
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<RoleExample />);

```

- 权限管理
- Permission 组件用于管理权限，包含租户权限、角色管理和共享群组三个子模块
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { Permission } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const PermissionExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Permission
          apis={{
            permission: {
              list: mockPreset.apis.tenant.getPermissionList,
              save: mockPreset.apis.tenant.savePermission
            },
            role: {
              list: mockPreset.apis.tenant.getRoleList,
              create: mockPreset.apis.tenant.createRole,
              save: mockPreset.apis.tenant.saveRole,
              remove: mockPreset.apis.tenant.removeRole,
              permissionSave: mockPreset.apis.tenant.savePermission,
              permissionList: mockPreset.apis.tenant.getPermissionList
            },
            userList: mockPreset.apis.tenant.userList,
            sharedGroup: mockPreset.apis.tenant.sharedGroup
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<PermissionExample />);

```

- 租户登录
- LoginTenant 组件用于租户选择登录，展示用户可访问的租户列表
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { LoginTenant } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const LoginTenantExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <LoginTenant tenantPath="/tenant" />
      </Layout>
    </PureGlobal>
  );
});

render(<LoginTenantExample />);

```

- 加入邀请
- JoinInvitation 组件用于处理租户邀请加入流程，展示公司信息确认和员工信息确认步骤
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { JoinInvitation } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card, Flex } = antd;

const JoinInvitationExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Flex vertical gap={24}>
          <Card title="成功示例（有效token）">
            <JoinInvitation baseUrl="" token="valid" />
          </Card>
          <Card title="失败示例（无效token）">
            <JoinInvitation baseUrl="" token="invalid" />
          </Card>
        </Flex>
      </Layout>
    </PureGlobal>
  );
});

render(<JoinInvitationExample />);

```

- 按组织选择成员
- TenantUserSelect 先选组织再选租户成员，适用于指定项目负责人等场景
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactFetch(@kne/react-fetch)

```jsx
const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const TenantUserSelectBaseExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, CancelButton } = FormInfo;
  const { Input } = FormInfo.fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        onSubmit={data => {
          console.log('提交数据:', data);
        }}>
        <FormInfo
          title="按组织选择负责人"
          column={1}
          list={[<Input name="projectName" label="项目名称" rule="REQ" placeholder="例如：Q2 产品迭代" />]}
        />
        <TenantUserSelect
          name="owner"
          label="项目负责人"
          rule="REQ"
          placeholder="请选择负责人"
          companyName="科技创新有限公司"
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <CancelButton style={{ marginRight: 8 }}>取消</CancelButton>
          <SubmitButton type="primary">提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<TenantUserSelectBaseExample />);

```

- 按组织多选成员
- TenantUserSelect 多选模式，用于选择多个协作成员
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactFetch(@kne/react-fetch)

```jsx
const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const TenantUserSelectMultipleExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { Input } = FormInfo.fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        onSubmit={data => {
          console.log('协作成员:', data);
        }}>
        <FormInfo
          title="跨部门协作"
          column={1}
          list={[<Input name="taskName" label="任务名称" rule="REQ" placeholder="例如：官网改版评审" />]}
        />
        <TenantUserSelect
          name="collaborators"
          label="协作成员"
          rule="REQ"
          single={false}
          companyName="科技创新有限公司"
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <SubmitButton type="primary">保存</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<TenantUserSelectMultipleExample />);

```

- 按组织选择成员（初始值）
- 编辑场景为 TenantUserSelect 设置默认成员，值为 { id, name }
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactFetch(@kne/react-fetch)

```jsx
const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const TenantUserSelectInitialExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        defaultValues={{
          approver: { id: 'user-2', name: '李娜' }
        }}
        onSubmit={data => {
          console.log('审批人:', data);
        }}>
        <TenantUserSelect
          name="approver"
          label="审批人"
          rule="REQ"
          companyName="科技创新有限公司"
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <SubmitButton type="primary">保存</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<TenantUserSelectInitialExample />);

```

- 按组织选择成员（状态筛选）
- 通过 userStatus 仅加载在职成员
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactFetch(@kne/react-fetch),antd(antd)

```jsx
const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Flex, Typography } = antd;

const TenantUserSelectStatusExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { Text } = Typography;

  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={16}>
        <Text type="secondary">仅展示状态为「开启」的成员（userStatus=&quot;open&quot;，亦兼容 active）</Text>
        <Form
          onSubmit={data => {
            console.log('交接人:', data);
          }}>
          <TenantUserSelect
            name="handoverUser"
            label="工作交接人"
            rule="REQ"
            userStatus="open"
            companyName="科技创新有限公司"
          />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <SubmitButton type="primary">确认</SubmitButton>
          </div>
        </Form>
      </Flex>
    </PureGlobal>
  );
});

render(<TenantUserSelectStatusExample />);

```

- 系统设置
- Setting 组件是系统设置的入口，包含公司信息、组织架构、权限管理、用户管理四个设置模块
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { Setting } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { MemoryRouter, Navigate, Route, Routes } = reactRouterDom;

const settingApis = {
  user: {
    list: mockPreset.apis.tenant.getUserList,
    create: mockPreset.apis.tenant.createUser,
    save: mockPreset.apis.tenant.saveUser,
    remove: mockPreset.apis.tenant.removeUser
  },
  permission: {
    list: mockPreset.apis.tenant.getPermissionList,
    save: mockPreset.apis.tenant.savePermission
  },
  role: {
    list: mockPreset.apis.tenant.getRoleList,
    create: mockPreset.apis.tenant.createRole,
    save: mockPreset.apis.tenant.saveRole,
    remove: mockPreset.apis.tenant.removeRole,
    permissionSave: mockPreset.apis.tenant.savePermission,
    permissionList: mockPreset.apis.tenant.getPermissionList
  },
  userList: mockPreset.apis.tenant.userList,
  sharedGroup: mockPreset.apis.tenant.sharedGroup
};

const SettingExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <MemoryRouter initialEntries={['/Tenant/setting/company']}>
          <Routes>
            <Route
              path="/Tenant/setting/*"
              element={
                <Setting
                  pageProps={{
                    menuFixed: false
                  }}
                  baseUrl="/Tenant"
                  apis={settingApis}
                />
              }
            />
            <Route path="/Tenant" element={<Navigate to="/Tenant/setting/company" replace />} />
            <Route path="*" element={<Navigate to="/Tenant/setting/company" replace />} />
          </Routes>
        </MemoryRouter>
      </Layout>
    </PureGlobal>
  );
});

render(<SettingExample />);

```

### API

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
| children | 自定义渲染 | function | - |

### LoginTenant 租户登录

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| tenantPath | 登录成功跳转路径 | string | - |
| children | 自定义渲染 | function | - |

### JoinInvitation 邀请加入

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 基础路径 | string | '' |
| children | 自定义渲染 | function | - |

### Setting 系统设置

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API 配置 | object | - |
| baseUrl | 基础路径 | string | - |

### TenantUserSelect 按组织选择租户用户

参考 `UserSelect`，用于在表单中先选组织、再选租户成员。左侧为组织树，右侧为成员选择器（`SuperSelect`），成员列表按所选组织及其子组织过滤（`filter.tenantOrgId`）。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 表单字段名称 | string | - |
| label | 表单标签 | string | - |
| rule | 校验规则，如 `REQ` | string | - |
| placeholder | 成员选择占位文本 | string | - |
| single | 是否单选 | boolean | true |
| disabled | 是否禁用 | boolean | false |
| userStatus | 成员状态筛选：`open` / `closed`（兼容 `active` → `open`、`inactive` → `closed`） | string | - |
| companyName | 组织树根节点（公司）名称 | string | - |
| showOrgRoot | 是否展示公司根节点 | boolean | true |
| orgApi | 自定义组织列表 API，默认 `apis.tenant.orgList` | object | - |
| userApi | 自定义成员列表 API，默认 `apis.tenant.userList` | object | - |

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
