const { default: UserTool } = _UserTool;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const { Button } = antd;

const WithChildrenExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  return (
    <PureGlobal preset={mockPreset}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, background: '#f5f5f5' }}>
        <UserTool
          avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=lisi"
          name="李四"
          email="lisi@tech-innovation.com"
        >
          <div style={{ padding: '8px 0' }}>
            <Button type="primary" block size="small">
              升级到专业版
            </Button>
          </div>
        </UserTool>
      </div>
    </PureGlobal>
  );
});

render(<WithChildrenExample />);
