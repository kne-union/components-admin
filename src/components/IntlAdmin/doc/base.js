const { default: IntlAdmin } = _IntlAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useNavigate, Navigate } = reactRouterDom;
const { Route, Routes } = reactRouterDom;

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
            path="/IntlAdmin/*"
            element={
              <IntlAdmin
                baseUrl="/IntlAdmin"
                pageProps={{
                  menuFixed: false
                }}
              />
            }
          />
          <Route path="/*" element={<Navigate to="/IntlAdmin" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);
