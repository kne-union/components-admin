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
