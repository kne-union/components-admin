const getColumns = () => {
  return [
    {
      name: 'id',
      title: 'ID',
      renderType: 'id'
    },
    {
      name: 'name',
      title: '名称',
      renderType: 'main'
    },
    {
      name: 'code',
      title: '编码'
    },
    {
      name: 'params',
      title: '翻译参数'
    },
    {
      name: 'description',
      title: '描述',
      renderType: 'description',
      ellipsis: true
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
