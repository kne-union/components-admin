const getColumns = () => {
  return [
    {
      name: ' id',
      title: 'ID',
      type: 'serialNumber',
      hover: false,
      primary: false
    },
    {
      name: 'name',
      title: '名称',
      type: 'mainInfo',
      hover: false,
      primary: false
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
      type: 'description',
      ellipsis: true
    },
    {
      name: 'status',
      title: '状态',
      type: 'tag',
      valueOf: ({ status }) =>
        status && {
          isEnum: true,
          moduleName: 'commonStatus',
          name: status
        }
    }
  ];
};

export default getColumns;
