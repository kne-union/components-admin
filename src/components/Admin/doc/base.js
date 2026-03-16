const { default: Admin } = _Admin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate, useNavigate, Button, Flex } = { ...reactRouterDom, ...antd };

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const navigate = useNavigate();
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route
            path="/Admin/admin/*"
            element={
              <Admin
                baseUrl="/Admin/admin"
                pageProps={{
                  menuFixed: false
                }}
              />
            }
          />
          <Route path="/Admin/*" element={<Navigate to="/Admin/admin/user" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);
