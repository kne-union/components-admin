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
