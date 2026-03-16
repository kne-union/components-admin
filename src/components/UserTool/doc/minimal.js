const { default: UserTool } = _UserTool;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const MinimalExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  return (
    <PureGlobal preset={mockPreset}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, background: '#f5f5f5' }}>
        <UserTool
          avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu"
        />
      </div>
    </PureGlobal>
  );
});

render(<MinimalExample />);
