const { RightOptions } = _UserTool;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const RightOptionsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  return (
    <PureGlobal preset={mockPreset}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, background: '#1890ff' }}>
        <RightOptions />
      </div>
    </PureGlobal>
  );
});

render(<RightOptionsExample />);
