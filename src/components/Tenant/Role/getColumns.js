const getColumns = () => {
  return [
    {
      name: 'id',
      title: 'ID',
      type: 'serialNumber',
      primary: false,
      hover: false
    },
    {
      name: 'name',
      title: '角色名称',
      type: 'mainInfo',
      primary: false,
      hover: false
    },
    {
      name: 'type',
      title: '类型',
      type: 'tag',
      valueOf: ({ type }) => {
        return type === 'system'
          ? {
              type: 'default',
              text: '系统'
            }
          : {
              type: 'info',
              text: '自定义'
            };
      }
    },
    {
      name: 'code',
      title: '角色编码'
    },
    {
      name: 'description',
      title: '描述',
      type: 'description',
      ellipsis: true
    }
  ];
};

export default getColumns;
