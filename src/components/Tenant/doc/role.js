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
