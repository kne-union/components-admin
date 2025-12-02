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
      title: '共享组名称',
      type: 'mainInfo',
      primary: false,
      hover: false
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
