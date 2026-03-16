const { AfterUserLoginLayout } = _Authenticate;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Typography, Card } = antd;

const { Title, Paragraph } = Typography;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <AfterUserLoginLayout 
        title="用户中心"
        navigation={{ isFixed: false }}
      >
        <Card>
          <Title level={4}>欢迎使用用户中心</Title>
          <Paragraph>
            这是一个用户登录后的布局示例。顶部导航栏显示用户信息和语言切换功能。
          </Paragraph>
        </Card>
      </AfterUserLoginLayout>
    </PureGlobal>
  );
});

render(<BaseExample />);
