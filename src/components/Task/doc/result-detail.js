const { Actions } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card } = antd;

const ResultDetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  // 获取成功的任务
  const successTask = taskList.data.pageData.find(task => task.status === 'success');

  return (
    <PureGlobal preset={mockPreset}>
      <Card title="成功任务详情" size="small">
        <div style={{ marginBottom: 8 }}>
          <strong>任务ID：</strong>{successTask.id}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务名称：</strong>{successTask.input.name}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务类型：</strong>{successTask.type}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>任务状态：</strong>
          <span style={{ color: '#52c41a' }}>{successTask.status}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>创建时间：</strong>{successTask.createdAt}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>完成时间：</strong>{successTask.completedAt}
        </div>
        <Actions data={successTask} type="primary" />
      </Card>
    </PureGlobal>
  );
});

render(<ResultDetailExample />);
