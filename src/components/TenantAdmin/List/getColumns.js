const getColumns = ({ navigate }) => {
  return [
    {
      name: 'id',
      title: 'ID',
      type: 'serialNumber',
      primary: true,
      hover: true,
      onClick: ({ colItem }) => {
        navigate(`detail?id=${colItem.id}`);
      }
    },
    {
      name: 'name',
      title: '名称',
      type: 'mainInfo',
      onClick: ({ colItem }) => {
        navigate(`detail?id=${colItem.id}`);
      }
    },
    {
      name: 'status',
      title: '状态',
      type: 'tag',
      valueOf: item => {
        return item.status === 'open' ? { type: 'success', text: '开启' } : { type: 'danger', text: '关闭' };
      }
    },
    {
      name: 'description',
      title: '描述',
      type: 'description',
      ellipsis: true
    },
    {
      name: 'createdAt',
      title: '添加时间',
      type: 'datetime'
    }
  ];
};

export default getColumns;
