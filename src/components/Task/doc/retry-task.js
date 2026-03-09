const { Actions } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Space, Card } = antd;

const RetryTaskExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  // 获取可以重试的任务
  const failedTask = taskList.data.pageData.find(task => task.status === 'failed');
  const canceledTask = taskList.data.pageData.find(task => task.status === 'canceled');

  const handleSuccess = () => {
    console.log('任务已重新提交执行');
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card title="失败的任务" size="small">
          <div style={{ marginBottom: 8 }}>
            任务名称：{failedTask.input.name}
          </div>
          <div style={{ marginBottom: 8 }}>
            任务状态：{failedTask.status}
          </div>
          <div style={{ marginBottom: 8, color: '#ff4d4f' }}>
            错误信息：{failedTask.error.message}
          </div>
          <Actions data={failedTask} type="primary" onSuccess={handleSuccess} />
        </Card>

        <Card title="已取消的任务" size="small">
          <div style={{ marginBottom: 8 }}>
            任务名称：{canceledTask.input.name}
          </div>
          <div style={{ marginBottom: 8 }}>
            任务状态：{canceledTask.status}
          </div>
          <Actions data={canceledTask} type="primary" onSuccess={handleSuccess} />
        </Card>
      </Space>
    </PureGlobal>
  );
});

render(<RetryTaskExample />);
