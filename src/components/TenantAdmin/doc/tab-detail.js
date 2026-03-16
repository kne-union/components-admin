const { TabDetail } = _TenantAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Routes, Route, Navigate } = reactRouterDom;

const TabDetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path="/detail" element={<TabDetail optionFixed={false} />} />
          <Route path="*" element={<Navigate to="/detail?id=tenant-001" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<TabDetailExample />);
