const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'id',
      title: 'ID',
      renderType: 'small'
    },
    {
      name: 'name',
      title: formatMessage({ id: 'SharedGroupName' }),
      renderType: 'main'
    },
    {
      name: 'description',
      title: formatMessage({ id: 'Description' }),
      renderType: 'description',
      ellipsis: true
    }
  ];
};

export default getColumns;
