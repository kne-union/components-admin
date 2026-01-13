const getColumns = () => {
  return [
    {
      name: 'id',
      title: 'ID',
      type: 'serialNumber',
      hover: false,
      primary: false
    },
    {
      name: 'namespace',
      title: '命名空间',
      type: 'mainInfo',
      hover: false,
      primary: false
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
      type: 'tag',
      valueOf: ({ reviewStatus }) =>
        reviewStatus && {
          isEnum: true,
          moduleName: 'reviewStatus',
          name: reviewStatus
        }
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
