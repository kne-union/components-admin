const { LoginTenant } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const LoginTenantExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <LoginTenant tenantPath="/tenant" systemName="Leapin" />
    </PureGlobal>
  );
});

render(<LoginTenantExample />);
