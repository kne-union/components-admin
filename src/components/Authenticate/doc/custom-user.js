const { AfterCustomUserLoginLayout } = _Authenticate;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Typography, Card } = antd;

const { Title, Paragraph } = Typography;

const CustomUserExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [PureGlobal, usePreset] = remoteModules;
  
  const InnerComponent = () => {
    const { apis } = usePreset();
    
    return (
      <AfterCustomUserLoginLayout 
        title="自定义用户中心" 
        api={apis.user.getUserInfo}
        navigation={{ isFixed: false }}
      >
        <Card>
          <Title level={4}>自定义用户系统</Title>
          <Paragraph>
            这是使用自定义 API 获取用户信息的布局示例。可以灵活配置用户信息接口。
          </Paragraph>
        </Card>
      </AfterCustomUserLoginLayout>
    );
  };
  
  return (
    <PureGlobal preset={mockPreset}>
      <InnerComponent />
    </PureGlobal>
  );
});

render(<CustomUserExample />);
