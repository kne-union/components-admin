const { getColumns } = _Task;
const { default: mockPreset, taskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const GetColumnsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout@TablePage', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, TablePage, Layout] = remoteModules;

  // 模拟国际化函数
  const formatMessage = ({ id }) => {
    const messages = {
      ID: 'ID',
      Type: '类型',
      Status: '状态',
      TargetName: '目标名称',
      ExecutionMode: '执行方式',
      CreatedAt: '创建时间',
      CompletedAt: '完成时间',
      UpdatedAt: '更新时间',
      ManualExecution: '手动执行',
      AutomaticExecution: '自动执行'
    };
    return messages[id] || id;
  };

  const columns = getColumns({ formatMessage });

  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <TablePage
          loader={() => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(taskList.data);
              }, 500);
            });
          }}
          columns={columns}
          pagination={{ paramsType: 'params' }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<GetColumnsExample />);
