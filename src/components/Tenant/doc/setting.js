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
