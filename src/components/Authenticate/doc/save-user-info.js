const { SaveUserInfo, UserInfo } = _Authenticate;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Button, Card, Space, Typography } = antd;

const { Title } = Typography;

const SaveUserInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <UserInfo>
        <Card style={{ maxWidth: 600, margin: '20px auto' }}>
          <Title level={4}>编辑用户信息</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <p>点击下方按钮可以编辑用户信息，包括头像、昵称、描述等。</p>
            <SaveUserInfo>
              {({ onClick }) => (
                <Button type="primary" onClick={onClick}>
                  编辑用户信息
                </Button>
              )}
            </SaveUserInfo>
          </Space>
        </Card>
      </UserInfo>
    </PureGlobal>
  );
});

render(<SaveUserInfoExample />);
