const { Setting } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/Tenant';
const settingBaseUrl = `${baseUrl}/setting`;
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
            path={`${settingBaseUrl}/*`}
            element={<Setting pageProps={pageProps} baseUrl={baseUrl} apis={settingApis} />}
          />
          <Route path="*" element={<Navigate to={`${settingBaseUrl}/company`} replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<SettingExample />);
