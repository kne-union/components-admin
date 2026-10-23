const { TenantApps } = _OidcAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card } = antd;

const tenant = { id: 'tenant-001', name: '科技创新有限公司' };

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Card title={`${tenant.name} · 子应用`}>
        <TenantApps tenant={tenant} />
      </Card>
    </PureGlobal>
  );
});

render(<BaseExample />);
