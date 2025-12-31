const getColumns = ({formatMessage}) => {
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
      title: formatMessage({ id: 'SharedGroupName' }),
      type: 'mainInfo',
      primary: false,
      hover: false
    },
    {
      name: 'description',
      title: formatMessage({ id: 'Description' }),
      type: 'description',
      ellipsis: true
    }
  ];
};

export default getColumns;
