const { DeadLetterActions } = _MessageQueue;
const { default: mockPreset, deadLetterList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card, Space } = antd;

const DeadLetterReplayExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const data = deadLetterList.pageData.find(item => !item.replayed);
  return (
    <PureGlobal preset={mockPreset}>
      <Card title="死信重放操作" size="small">
        <Space>
          <span>{data.topic}</span>
          <DeadLetterActions data={data} type="primary" />
        </Space>
      </Card>
    </PureGlobal>
  );
});

render(<DeadLetterReplayExample />);
