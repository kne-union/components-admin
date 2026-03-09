const { Actions } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Space, Card } = antd;

const CancelTaskExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const { useState } = React;

  // 获取可以取消的任务
  const pendingTask = taskList.data.pageData.find(task => task.status === 'pending');
  const runningTask = taskList.data.pageData.find(task => task.status === 'running');

  const handleSuccess = () => {
    console.log('任务已取消');
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card title="等待执行的任务" size="small">
          <div style={{ marginBottom: 8 }}>
            任务名称：{pendingTask.input.name}
          </div>
          <div style={{ marginBottom: 8 }}>
            任务状态：{pendingTask.status}
          </div>
          <Actions data={pendingTask} type="primary" onSuccess={handleSuccess} />
        </Card>

        <Card title="执行中的任务" size="small">
          <div style={{ marginBottom: 8 }}>
            任务名称：{runningTask.input.name}
          </div>
          <div style={{ marginBottom: 8 }}>
            任务状态：{runningTask.status}
          </div>
          <Actions data={runningTask} type="primary" onSuccess={handleSuccess} />
        </Card>
      </Space>
    </PureGlobal>
  );
});

render(<CancelTaskExample />);
