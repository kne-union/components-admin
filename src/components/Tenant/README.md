# Tenant

### 概述

租户管理系统组件，提供公司信息管理、组织架构管理、用户管理、角色权限管理等完整的租户管理功能。


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
- OrgInfo 组件用于管理组织架构，支持树形和图形两种展示模式，可添加、编辑、删除组织节点
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { OrgInfo } = _Tenant;
const { default: mockPreset, tenantData } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const OrgInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <OrgInfo
          data={tenantData.orgList}
          companyName={tenantData.company.name}
          apis={{
            create: { loader: () => ({ id: &#96;dept-${Date.now()}&#96; }) },
            save: { loader: () => ({ code: 0 }) },
            remove: { loader: () => ({ code: 0 }) }
          }}
          onSuccess={() => {
            console.log('操作成功');
          }}
        />
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
            }
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

- 系统设置
- Setting 组件是系统设置的入口，包含公司信息、组织架构、权限管理、用户管理四个设置模块
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { Setting } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useNavigate, Navigate } = reactRouterDom;
const { Route, Routes } = reactRouterDom;

const SettingExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route
            path="/Tenant/setting/*"
            element={
              <Setting
                pageProps={{
                  menuFixed: false
                }}
                baseUrl="/Tenant"
                apis={{
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
                  }
                }}
              />
            }
          />
          <Route path="/Tenant/*" element={<Navigate to="/Tenant/setting" replace />} />
        </Routes>
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
| apis | API 配置 | object | - |
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
