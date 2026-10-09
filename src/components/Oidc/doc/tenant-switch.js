const { OidcAuthenticate, TenantSwitch, OidcLogout } = _Oidc;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card, Flex, Typography } = antd;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <OidcAuthenticate>
        {({ client }) => (
          <Card title="人力资源门户">
            <Flex vertical gap={16}>
              <Typography.Text type="secondary">已登录应用：{client.config.clientId}</Typography.Text>
              <Flex gap={12} wrap>
                <TenantSwitch />
                <OidcLogout danger />
              </Flex>
            </Flex>
          </Card>
        )}
      </OidcAuthenticate>
    </PureGlobal>
  );
});

render(<BaseExample />);
