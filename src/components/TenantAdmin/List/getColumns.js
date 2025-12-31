const getColumns = ({ navigate, formatMessage }) => {
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
      title: formatMessage({ id: 'Name' }),
      type: 'mainInfo',
      onClick: ({ colItem }) => {
        navigate(`detail?id=${colItem.id}`);
      }
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      type: 'tag',
      valueOf: item => {
        return item.status === 'open' ? { type: 'success', text: formatMessage({ id: 'Open' }) } : { type: 'danger', text: formatMessage({ id: 'Close' }) };
      }
    },
    {
      name: 'description',
      title: formatMessage({ id: 'Description' }),
      type: 'description',
      ellipsis: true
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      type: 'datetime'
    }
  ];
};

export default getColumns;
