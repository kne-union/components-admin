const { JoinInvitation } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card, Flex } = antd;

const JoinInvitationExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Flex vertical gap={24}>
          <Card title="成功示例（有效token）">
            <JoinInvitation baseUrl="" token="valid" />
          </Card>
          <Card title="失败示例（无效token）">
            <JoinInvitation baseUrl="" token="invalid" />
          </Card>
        </Flex>
      </Layout>
    </PureGlobal>
  );
});

render(<JoinInvitationExample />);
