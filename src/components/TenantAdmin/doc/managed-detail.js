const { TabDetail } = _TenantAdmin;
const { TenantApps } = _OidcAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Routes, Route, Navigate } = reactRouterDom;

const preset = Object.assign({}, mockPreset, {
  plugins: Object.assign({}, mockPreset.plugins, {
    admin: { tenant: { appendTabDetails: [{ tab: '子应用', key: 'apps', component: TenantApps, index: 3 }] } }
  })
});

const ManagedDetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={preset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path="/managed-detail" element={<TabDetail optionFixed={false} />} />
          <Route path="*" element={<Navigate to="/managed-detail?id=tenant-host-001" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<ManagedDetailExample />);
