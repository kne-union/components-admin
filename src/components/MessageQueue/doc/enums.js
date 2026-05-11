const { enums } = _MessageQueue;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card, Space, Tag } = antd;

const EnumsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const getColor = type => ({ success: 'green', danger: 'red', progress: 'blue', info: 'default' })[type] || 'default';
  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="消息状态">
          <Space wrap>
            {enums.messageStatus.map(item => (
              <Tag key={item.value} color={getColor(item.type)}>{item.value} - {item.description}</Tag>
            ))}
          </Space>
        </Card>
        <Card title="轨迹事件">
          <Space wrap>
            {enums.traceEvent.map(item => (
              <Tag key={item.value} color={getColor(item.type)}>{item.value} - {item.description}</Tag>
            ))}
          </Space>
        </Card>
      </Space>
    </PureGlobal>
  );
});

render(<EnumsExample />);
