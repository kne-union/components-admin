const { default: mockPreset } = _mockPreset;
const { getColumns } = _Signature;
const { createWithRemoteLoader } = remoteLoader;
const { Table } = antd;

const GetColumnsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  
  // 模拟国际化函数
  const formatMessage = ({ id }) => {
    const messages = {
      'BelongUser': '所属用户',
      'Description': '描述',
      'LastVisitedAt': '最后访问时间',
      'Status': '状态',
      'CreatedAt': '创建时间',
      'Enabled': '启用',
      'Disabled': '禁用'
    };
    return messages[id] || id;
  };

  // 获取表格列配置
  const columns = getColumns({ formatMessage });

  // 模拟数据
  const data = [
    {
      id: 1,
      appId: 'app_20240308001',
      secretKey: 'sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      user: {
        nickname: '张三',
        email: 'zhangsan@example.com',
        phone: '138****1234'
      },
      description: '用于API对接的主密钥',
      lastVisitedAt: '2024-03-08 14:30:00',
      status: 0,
      createdAt: '2024-03-01 09:00:00'
    },
    {
      id: 2,
      appId: 'app_20240305002',
      secretKey: 'sk_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4',
      user: {
        nickname: '李四',
        email: 'lisi@example.com',
        phone: '139****5678'
      },
      description: '测试环境使用的签名密钥',
      lastVisitedAt: '2024-03-05 16:20:00',
      status: 1,
      createdAt: '2024-02-28 11:00:00'
    }
  ];

  return (
    <PureGlobal preset={mockPreset}>
      <Table
        dataSource={data}
        columns={columns.map(col => ({
          ...col,
          key: col.name,
          dataIndex: col.name,
          title: col.title,
          render: col.type === 'tag' 
            ? (value, record) => {
                const tagData = col.valueOf(record, { name: col.name });
                return <span style={{ color: tagData.type === 'success' ? '#52c41a' : '#ff4d4f' }}>{tagData.text}</span>;
              }
            : col.type === 'datetime'
            ? (value) => value
            : col.type === 'other' && col.valueOf
            ? (value, record) => col.valueOf(record)
            : (value) => value
        }))}
        pagination={false}
      />
    </PureGlobal>
  );
});

render(<GetColumnsExample />);
