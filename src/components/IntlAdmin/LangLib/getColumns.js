const getColumns = () => {
  return [
    {
      name: 'id',
      title: 'ID',
      renderType: 'id'
    },
    {
      name: 'namespace',
      title: '命名空间',
      renderType: 'main'
    },
    {
      name: 'locale',
      title: '语言'
    },
    {
      name: 'code',
      title: '编码'
    },
    {
      name: 'target',
      title: '目标值'
    },
    {
      name: 'reviewStatus',
      title: '审核状态',
      renderType: 'enum',
      moduleName: 'reviewStatus',
      getValueOf: item => item.reviewStatus
    },
    {
      name: 'status',
      title: '状态',
      renderType: 'enum',
      moduleName: 'openStatus',
      getValueOf: item => item.status
    }
  ];
};

export default getColumns;
