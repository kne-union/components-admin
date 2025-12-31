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
      title: formatMessage({ id: 'RoleName' }),
      type: 'mainInfo',
      primary: false,
      hover: false
    },
    {
      name: 'type',
      title: formatMessage({ id: 'SettingType' }),
      type: 'tag',
      valueOf: ({ type }) => {
        return type === 'system'
          ? {
              type: 'default',
              text: formatMessage({ id: 'SystemType' })
            }
          : {
              type: 'info',
              text: formatMessage({ id: 'CustomType' })
            };
      }
    },
    {
      name: 'code',
      title: formatMessage({ id: 'RoleCode' })
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
