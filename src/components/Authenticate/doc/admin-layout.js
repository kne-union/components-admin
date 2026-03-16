const { AfterAdminUserLoginLayout } = _Authenticate;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Typography, Card } = antd;

const { Title, Paragraph } = Typography;

const AdminLayoutExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <AfterAdminUserLoginLayout 
        title="管理后台"
        navigation={{ isFixed: false }}
      >
        <Card>
          <Title level={4}>管理员控制台</Title>
          <Paragraph>
            这是管理员登录后的布局示例。顶部显示管理员信息和系统管理功能入口。
          </Paragraph>
        </Card>
      </AfterAdminUserLoginLayout>
    </PureGlobal>
  );
});

render(<AdminLayoutExample />);
