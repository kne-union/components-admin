const { enums } = _Task;
const { Space, Tag } = antd;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const EnumsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Enum']
})(({ remoteModules }) => {
  const [PureGlobal, Enum] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <h4>任务状态枚举（taskStatus）</h4>
          <Space wrap>
            <Enum moduleName="taskStatus">
              {taskStatusList => {
                return taskStatusList.map(status => (
                  <Tag
                    key={status.value}
                    color={
                      status.type === 'success'
                        ? 'green'
                        : status.type === 'danger'
                          ? 'red'
                          : status.type === 'progress'
                            ? 'blue'
                            : status.type === 'info'
                              ? 'default'
                              : 'default'
                    }>
                    {status.value}: {status.description}
                  </Tag>
                ));
              }}
            </Enum>
          </Space>
        </div>
      </Space>
    </PureGlobal>
  );
});

render(<EnumsExample />);
