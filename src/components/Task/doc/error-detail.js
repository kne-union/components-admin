const { Actions } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card } = antd;

const ErrorDetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  // 获取失败的任务
  const failedTask = taskList.data.pageData.find(task => task.status === 'failed');

  return (
    <PureGlobal preset={mockPreset}>
      <Card title="失败任务详情" size="small">
        <div style={{ marginBottom: 8 }}>
          <strong>任务ID：</strong>{failedTask.id}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务名称：</strong>{failedTask.input.name}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务类型：</strong>{failedTask.type}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务状态：</strong>
          <span style={{ color: '#ff4d4f' }}>{failedTask.status}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>错误代码：</strong>{failedTask.error.code}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>错误信息：</strong>{failedTask.error.message}
        </div>
        <Actions data={failedTask} type="primary" />
      </Card>
    </PureGlobal>
  );
});

render(<ErrorDetailExample />);
