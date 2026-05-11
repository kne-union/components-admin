const { Actions } = _MessageQueue;
const { default: mockPreset, messageQueueList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card, Space } = antd;

const MessageDetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const data = messageQueueList.pageData[0];
  return (
    <PureGlobal preset={mockPreset}>
      <Card title="消息详情操作" size="small">
        <Space>
          <span>{data.topic}</span>
          <Actions data={data} type="primary" />
        </Space>
      </Card>
    </PureGlobal>
  );
});

render(<MessageDetailExample />);
