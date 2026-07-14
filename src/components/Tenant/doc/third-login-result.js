const { ThirdLoginResult } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/third-login-result';

const ThirdLoginResultExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Routes>
        <Route path={baseUrl} element={<ThirdLoginResult />} />
        <Route path="*" element={<Navigate to={`${baseUrl}?platform=wecom`} replace />} />
      </Routes>
    </PureGlobal>
  );
});

render(<ThirdLoginResultExample />);
