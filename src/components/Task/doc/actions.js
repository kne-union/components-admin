const { Actions } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Space, Button } = antd;

const ActionsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const { useState } = React;
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取不同状态的任务数据
  const pendingTask = taskList.data.pageData.find(task => task.status === 'pending');
  const runningTask = taskList.data.pageData.find(task => task.status === 'running');
  const failedTask = taskList.data.pageData.find(task => task.status === 'failed');
  const successTask = taskList.data.pageData.find(task => task.status === 'success');
  const canceledTask = taskList.data.pageData.find(task => task.status === 'canceled');

  const handleSuccess = () => {
    console.log('操作成功');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>等待执行的手动任务（显示完成和取消按钮）：</div>
          <Actions
            data={pendingTask}
            type="primary"
            onSuccess={handleSuccess}
            getManualTaskAction={data => {
              return props => (
                <Button
                  {...props}
                  onClick={() => {
                    console.log('完成任务:', data);
                    props.onSuccess?.();
                  }}>
                  完成
                </Button>
              );
            }}
          />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>执行中的任务（显示取消按钮）：</div>
          <Actions data={runningTask} type="default" onSuccess={handleSuccess} />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>失败的任务（显示重试和错误详情按钮）：</div>
          <Actions data={failedTask} type="link" onSuccess={handleSuccess} />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>成功的任务（显示查看结果按钮）：</div>
          <Actions data={successTask} type="link" onSuccess={handleSuccess} />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>已取消的任务（显示重试按钮）：</div>
          <Actions data={canceledTask} type="default" onSuccess={handleSuccess} />
        </div>
      </Space>
    </PureGlobal>
  );
});

render(<ActionsExample />);
