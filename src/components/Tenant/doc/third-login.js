const { ThirdLogin } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/third-login';

const ThirdLoginExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Routes>
        <Route path={baseUrl} element={<ThirdLogin />} />
        <Route path="*" element={<Navigate to={`${baseUrl}?platform=wecom&tenantId=1`} replace />} />
      </Routes>
    </PureGlobal>
  );
});

render(<ThirdLoginExample />);
