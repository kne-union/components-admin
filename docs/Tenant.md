# Tenant

### 概述

租户管理系统组件，提供公司信息管理、组织架构管理、用户管理、角色权限管理等完整的租户管理功能。子组件 `TenantUserSelect` 支持按组织树筛选并选择租户成员；默认双栏面板，另提供 `TenantUserSelect.Input`（SelectInput 下拉/弹窗）及对应 `.Field` 纯控件。


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

const tenant = tenantAdminData.tenantDetail;
const tenantId = tenant.id;

const orgApis = {
  create: Object.assign({}, mockPreset.apis.tenantAdmin.orgCreate, {
    data: { tenantId }
  }),
  save: Object.assign({}, mockPreset.apis.tenantAdmin.orgSave, {
    data: { tenantId }
  }),
  remove: Object.assign({}, mockPreset.apis.tenantAdmin.orgRemove, {
    data: { tenantId }
  }),
  userList: Object.assign({}, mockPreset.apis.tenantAdmin.userList, {
    params: { tenantId }
  }),
  orgList: Object.assign({}, mockPreset.apis.tenantAdmin.orgList, {
    params: { tenantId }
  }),
  import: mockPreset.apis.tenantAdmin.orgBatchImport,
  orgLinkConfig: Object.assign({}, mockPreset.apis.tenantAdmin.orgLinkConfig, {
    params: { tenantId }
  }),
  orgLinkSave: Object.assign({}, mockPreset.apis.tenantAdmin.orgLinkSave, {
    data: { tenantId }
  }),
  orgLinkSync: Object.assign({}, mockPreset.apis.tenantAdmin.orgLinkSync, {
    data: { tenantId }
  }),
  orgLinkCancel: Object.assign({}, mockPreset.apis.tenantAdmin.orgLinkCancel, {
    data: { tenantId }
  })
};

const OrgInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Fetch
          {...Object.assign({}, mockPreset.apis.tenantAdmin.orgLinkConfig, {
            params: { tenantId }
          })}
          render={({ data: linkConfigData, reload: reloadLinkConfig }) => {
            const linkedSource = linkConfigData?.enabled ? linkConfigData.source : null;
            const syncSupported = linkConfigData?.syncSupported;
            return (
              <Fetch
                {...Object.assign({}, mockPreset.apis.tenantAdmin.orgList, {
                  params: { tenantId }
                })}
                render={({ data, reload }) => (
                  <OrgInfo
                    data={data}
                    tenantId={tenantId}
                    companyName={tenant?.tenantCompany?.name}
                    onSuccess={reload}
                    linkedSource={linkedSource}
                    linkSettingProps={
                      syncSupported
                        ? {
                            tenantId,
                            envArgs: tenant.tenantSetting?.args || [],
                            onLinkChange: reloadLinkConfig
                          }
                        : null
                    }
                    apis={orgApis}
                  />
                )}
              />
            );
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

- 第三方登录
- ThirdLogin 组件用于第三方登录页，路由 path 为 third-login；根据 platform（wecom / dingtalk）展示对应平台 logo 与标题
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom),antd(antd)

```jsx
const { ThirdLogin } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;
const { Flex, Typography } = antd;

const baseUrl = '/third-login';

const DocPanel = () => (
  <Flex
    vertical
    gap={12}
    style={{
      padding: '14px 16px',
      borderRadius: 12,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.96) 100%)',
      border: '1px solid rgba(15, 23, 42, 0.08)',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
    }}
  >
    <Typography.Text strong style={{ fontSize: 13, color: 'rgba(15,23,42,0.88)' }}>
      对接说明（入口页 ThirdLogin）
    </Typography.Text>
    <Flex vertical gap={4}>
      <Typography.Text strong style={{ fontSize: 12 }}>
        对接要求
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.7 }}>
        · 通用：URL 必传 platform（wecom / dingtalk）、tenantId；可选 redirect（登录成功后业务回跳地址）。租户需已在后台完成对应平台的组织关联/应用配置。
        <br />
        · 企业微信：配置企微自建应用（AgentId 等），授权回调域名需指向本系统的 third-login-result 页。
        <br />
        · 钉钉：配置钉钉企业内部应用，需准备 corpId、clientId（AppKey）；登录结果页须在钉钉客户端内打开（依赖 JSAPI）。
      </Typography.Text>
    </Flex>
    <Flex vertical gap={4}>
      <Typography.Text strong style={{ fontSize: 12 }}>
        对接流程
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.7 }}>
        1. 业务方打开 /third-login?platform=wecom|dingtalk&tenantId=xxx&redirect=编码后的业务地址
        <br />
        2. 组件调用 thirdLogin 接口，获取平台 OAuth 授权链接 redirectUrl 并跳转
        <br />
        3. 用户在企微/钉钉完成授权后，平台回跳至 /third-login-result
        <br />
        4. 结果页换取登录凭证后写入 token，再跳转 redirect 业务页
      </Typography.Text>
    </Flex>
  </Flex>
);

const ThirdLoginExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={20} style={{ minHeight: '100%' }}>
        <DocPanel />
        <Routes>
          <Route path={baseUrl} element={<ThirdLogin />} />
          <Route path="*" element={<Navigate to={&#96;${baseUrl}?platform=wecom&tenantId=1&#96;} replace />} />
        </Routes>
      </Flex>
    </PureGlobal>
  );
});

render(<ThirdLoginExample />);

```

- 第三方登录结果
- ThirdLoginResult 组件用于第三方登录结果页，路由 path 为 third-login-result；企业微信需 platform/tenantId/code，钉钉另需 corpId/clientId
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom),antd(antd),icons(@ant-design/icons)

```jsx
const { ThirdLoginResult } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate, useNavigate, useSearchParams } = reactRouterDom;
const { Flex, Segmented, Typography } = antd;
const { WechatWorkOutlined, DingdingOutlined } = icons;

const baseUrl = '/third-login-result';
const redirect = encodeURIComponent('https://example.com/home');
const configProps = {
  corpId: 'ding-corp-id',
  clientId: 'ding-client-id'
};

const PLATFORM_URLS = {
  wecom: &#96;${baseUrl}?platform=wecom&code=mock-wecom-auth-code&message=success&redirect=${redirect}&tenantId=1&#96;,
  dingtalk: &#96;${baseUrl}?platform=dingtalk&code=200&message=success&redirect=${redirect}&corpId=${configProps.corpId}&clientId=${configProps.clientId}&tenantId=1&#96;
};

const PLATFORM_OPTIONS = [
  {
    value: 'wecom',
    label: (
      <Flex align="center" gap={6}>
        <WechatWorkOutlined />
        企业微信
      </Flex>
    )
  },
  {
    value: 'dingtalk',
    label: (
      <Flex align="center" gap={6}>
        <DingdingOutlined />
        钉钉
      </Flex>
    )
  }
];

const DocPanel = () => (
  <Flex
    vertical
    gap={12}
    style={{
      padding: '14px 16px',
      borderRadius: 12,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.96) 100%)',
      border: '1px solid rgba(15, 23, 42, 0.08)',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
    }}
  >
    <Typography.Text strong style={{ fontSize: 13, color: 'rgba(15,23,42,0.88)' }}>
      对接说明（结果页 ThirdLoginResult）
    </Typography.Text>
    <Flex vertical gap={4}>
      <Typography.Text strong style={{ fontSize: 12 }}>
        企业微信
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.7 }}>
        对接要求：回跳 URL 必传 platform=wecom、tenantId、code（OAuth 授权码）；可选 redirect、message（中间页状态文案，不参与业务接口）。
        <br />
        对接流程：企微 OAuth 回跳 → URL 上的 code 即为 auth code → 调用 thirdLoginResult → 成功后写入 X-Third-Login-Token → 若有 redirect 则跳转业务页。
      </Typography.Text>
    </Flex>
    <Flex vertical gap={4}>
      <Typography.Text strong style={{ fontSize: 12 }}>
        钉钉
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.7 }}>
        对接要求：回跳 URL 必传 platform=dingtalk、tenantId、corpId、clientId；可选 redirect、message。注意 URL 上的 code 为状态码（如
        200），不是授权码；页面必须在钉钉客户端内打开。
        <br />
        对接流程：钉钉回跳结果页 → 用 corpId/clientId 调用 dingtalk-jsapi requestAuthCode 获取真实 auth code → 调用 thirdLoginResult →
        写入 token → 若有 redirect 则跳转业务页。
      </Typography.Text>
    </Flex>
  </Flex>
);

const PlatformSwitcher = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform') === 'dingtalk' ? 'dingtalk' : 'wecom';

  return (
    <Flex
      align="center"
      justify="space-between"
      wrap="wrap"
      gap={12}
      style={{
        padding: '12px 16px',
        borderRadius: 12,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.96) 100%)',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
      }}
    >
      <Flex vertical gap={2} style={{ minWidth: 180 }}>
        <Typography.Text strong style={{ fontSize: 13, color: 'rgba(15,23,42,0.88)' }}>
          登录结果预览
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
          切换平台以验证回跳参数与授权流程
        </Typography.Text>
      </Flex>
      <Segmented
        size="middle"
        value={platform}
        options={PLATFORM_OPTIONS}
        onChange={value => navigate(PLATFORM_URLS[value])}
      />
    </Flex>
  );
};

const ThirdLoginResultExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={20} style={{ minHeight: '100%' }}>
        <DocPanel />
        <PlatformSwitcher />
        <Routes>
          <Route path={baseUrl} element={<ThirdLoginResult />} />
          <Route path="*" element={<Navigate to={PLATFORM_URLS.wecom} replace />} />
        </Routes>
      </Flex>
    </PureGlobal>
  );
});

render(<ThirdLoginResultExample />);

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
- 编辑场景为 TenantUserSelect 设置默认成员，单选值为 { id, name }
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
        data={{
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

- 按组织选择成员（多选初始值）
- 编辑场景多选回填，值为 [{ id, name }, ...]，支持跨部门已选成员
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactFetch(@kne/react-fetch)

```jsx
const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const TenantUserSelectInitialMultipleExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { Input } = FormInfo.fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        data={{
          taskName: '官网改版评审',
          collaborators: [
            { id: 'user-2', name: '李娜' },
            { id: 'user-3', name: '王强' },
            { id: 'user-4', name: '刘芳' }
          ]
        }}
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

render(<TenantUserSelectInitialMultipleExample />);

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

- 按组织选择成员（大量数据）
- 模拟 10 个事业部、80 个团队共 90 个组织节点，每个组织 256 名成员，右侧列表每页 20 条并支持滚动加载
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactFetch(@kne/react-fetch),antd(antd)

```jsx
const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Flex, Typography } = antd;

const TOTAL_USERS = 256;
const PAGE_SIZE = 20;
const LOAD_DELAY_MS = 400;
const ORG_ROOT_COUNT = 10;
const TEAMS_PER_ORG = 8;

const POSITIONS = ['前端工程师', '后端工程师', 'UI 设计师', '产品经理', '测试工程师', '运维工程师'];

const buildLargeOrgList = () => {
  const list = [];
  for (let i = 1; i <= ORG_ROOT_COUNT; i++) {
    const rootId = &#96;large-dept-${i}&#96;;
    list.push({
      id: rootId,
      name: &#96;事业部 ${String(i).padStart(2, '0')}&#96;,
      parentId: null
    });
    for (let j = 1; j <= TEAMS_PER_ORG; j++) {
      list.push({
        id: &#96;${rootId}-team-${j}&#96;,
        name: &#96;团队 ${i}-${String(j).padStart(2, '0')}&#96;,
        parentId: rootId
      });
    }
  }
  return list;
};

const largeOrgList = buildLargeOrgList();
const orgNameMap = largeOrgList.reduce((map, item) => {
  map[item.id] = item.name;
  return map;
}, {});

const largeOrgListApi = {
  loader: () =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve({
          pageData: largeOrgList,
          totalCount: largeOrgList.length
        });
      }, 200);
    })
};

const largeUserListApi = {
  loader: ({ params } = {}) => {
    const perPage = Number(params?.perPage) || PAGE_SIZE;
    const currentPage = Number(params?.currentPage) || 1;
    const tenantOrgId = params?.filter?.tenantOrgId;

    return new Promise(resolve => {
      setTimeout(() => {
        if (!tenantOrgId) {
          resolve({ pageData: [], totalCount: 0 });
          return;
        }

        const orgName = orgNameMap[tenantOrgId] || '当前组织';
        const start = (currentPage - 1) * perPage;
        const pageData = Array.from({ length: Math.min(perPage, Math.max(TOTAL_USERS - start, 0)) }, (_, index) => {
          const order = start + index + 1;
          return {
            id: &#96;large-user-${tenantOrgId}-${order}&#96;,
            name: &#96;成员 ${String(order).padStart(3, '0')}&#96;,
            email: &#96;member${order}@tech-innovation.com&#96;,
            phone: &#96;138${String(10000000 + order).slice(-8)}&#96;,
            avatar: &#96;https://api.dicebear.com/7.x/avataaars/svg?seed=large-${tenantOrgId}-${order}&#96;,
            position: POSITIONS[order % POSITIONS.length],
            department: orgName,
            tenantOrg: { id: tenantOrgId, name: orgName },
            status: 'open'
          };
        });

        resolve({
          pageData,
          totalCount: TOTAL_USERS
        });
      }, LOAD_DELAY_MS);
    });
  }
};

const TenantUserSelectLargeDataExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { Input } = FormInfo.fields;
  const { Text } = Typography;

  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={16}>
        <Text type="secondary">
          模拟 {ORG_ROOT_COUNT} 个事业部、{ORG_ROOT_COUNT * TEAMS_PER_ORG} 个团队，共 {largeOrgList.length}{' '}
          个组织节点；每个组织下 {TOTAL_USERS} 名成员，每页加载 {PAGE_SIZE} 条。请先在左侧选择组织，再在右侧列表中向下滚动以触发加载更多。
        </Text>
        <Form
          onSubmit={data => {
            console.log('大规模成员选择:', data);
          }}>
          <FormInfo
            title="大规模成员选择"
            column={1}
            list={[<Input name="batchName" label="批次名称" rule="REQ" placeholder="例如：2026 Q2 全员培训" />]}
          />
          <TenantUserSelect
            name="participants"
            label="参训成员"
            rule="REQ"
            single={false}
            companyName="科技创新有限公司"
            orgApi={largeOrgListApi}
            userApi={largeUserListApi}
          />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <SubmitButton type="primary">保存</SubmitButton>
          </div>
        </Form>
      </Flex>
    </PureGlobal>
  );
});

render(<TenantUserSelectLargeDataExample />);

```

- 按组织选择成员（下拉 SelectInput）
- TenantUserSelect.Input 基于 @kne/super-select SelectInput，isPopup 下拉展开组织+成员面板
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const TenantUserSelectInputPopupExample = createWithRemoteLoader({
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
          title="下拉选择负责人（SelectInput isPopup）"
          column={1}
          list={[<Input name="projectName" label="项目名称" rule="REQ" placeholder="例如：Q2 产品迭代" />]}
        />
        <TenantUserSelect.Input
          name="owner"
          label="项目负责人"
          rule="REQ"
          isPopup
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

render(<TenantUserSelectInputPopupExample />);

```

- 按组织选择成员（弹窗 SelectInput）
- TenantUserSelect.Input isPopup={false} 以弹窗完成组织成员选择，支持单选/多选切换
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useState } = React;
const { Flex, Switch, Typography } = antd;

const TenantUserSelectInputModalExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const [single, setSingle] = useState(true);

  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={16}>
        <Flex align="center" gap={8}>
          <Typography.Text>单选</Typography.Text>
          <Switch checked={single} onChange={setSingle} />
        </Flex>
        <Form
          key={single ? 'single' : 'multiple'}
          onSubmit={data => {
            console.log('弹窗选择结果:', data);
          }}>
          <TenantUserSelect.Input
            name="members"
            label={single ? '负责人' : '协作成员'}
            rule="REQ"
            isPopup={false}
            single={single}
            companyName="科技创新有限公司"
            height={520}
            overlayWidth={800}
          />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <SubmitButton type="primary">保存</SubmitButton>
          </div>
        </Form>
      </Flex>
    </PureGlobal>
  );
});

render(<TenantUserSelectInputModalExample />);

```

- 按组织选择成员（SelectInput.Field）
- TenantUserSelect.Input.Field 纯控件，不依赖 Form，value/onChange 受控
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useState } = React;
const { Flex, Button, Typography } = antd;

const TenantUserSelectInputFieldExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [value, setValue] = useState(null);

  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={12} style={{ maxWidth: 480 }}>
        <Typography.Text type="secondary">
          TenantUserSelect.Input.Field 为纯控件，不依赖 Form，通过 value / onChange 受控
        </Typography.Text>
        <TenantUserSelect.Input.Field
          value={value}
          onChange={setValue}
          isPopup
          single
          companyName="科技创新有限公司"
          placeholder="请选择成员"
        />
        <Typography.Paragraph>
          <Typography.Text strong>当前值：</Typography.Text>
          <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{JSON.stringify(value, null, 2)}</pre>
        </Typography.Paragraph>
        <Button onClick={() => setValue(null)}>清空</Button>
      </Flex>
    </PureGlobal>
  );
});

render(<TenantUserSelectInputFieldExample />);

```

- 系统设置(全屏)
- Setting 组件是系统设置的入口，包含公司信息、组织架构、权限管理、用户管理四个设置模块。示例环境已有外层 Router，使用 Routes 匹配子路由，勿嵌套 MemoryRouter。
- _Tenant(@components/Tenant),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { Setting } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/Tenant';
const settingBaseUrl = &#96;${baseUrl}/setting&#96;;
const pageProps = { menuFixed: false };

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
        <Routes>
          <Route
            path={&#96;${settingBaseUrl}/*&#96;}
            element={<Setting pageProps={pageProps} baseUrl={baseUrl} apis={settingApis} />}
          />
          <Route path="*" element={<Navigate to={&#96;${settingBaseUrl}/company&#96;} replace />} />
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
