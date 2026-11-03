const { JoinInvitation } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Divider } = antd;

const JoinInvitationExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Divider titlePlacement="start">成功示例（有效token）</Divider>
      <JoinInvitation baseUrl="" token="valid" systemName="Leapin" />
      <Divider titlePlacement="start">失败示例（无效token）</Divider>
      <JoinInvitation baseUrl="" token="invalid" systemName="Leapin" />
    </PureGlobal>
  );
});

render(<JoinInvitationExample />);
