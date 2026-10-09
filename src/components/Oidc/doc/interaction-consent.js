const { Interaction } = _Oidc;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Interaction uid="demo-consent" systemName="统一登录中心" />
    </PureGlobal>
  );
});

render(<BaseExample />);
