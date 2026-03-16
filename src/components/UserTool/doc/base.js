const { default: UserTool } = _UserTool;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  const handleEditProfile = () => {
    console.log('编辑个人资料');
  };

  const handleChangePassword = () => {
    console.log('修改密码');
  };

  return (
    <PureGlobal preset={mockPreset}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, background: '#f5f5f5' }}>
        <UserTool
          avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan"
          name="张三"
          email="zhangsan@example.com"
          list={[
            { iconType: 'icon-gerenziliao', label: '个人资料', onClick: handleEditProfile },
            { iconType: 'icon-xiugaimima', label: '修改密码', onClick: handleChangePassword }
          ]}
        />
      </div>
    </PureGlobal>
  );
});

render(<BaseExample />);
