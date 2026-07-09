const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'id',
      title: 'ID',
      renderType: 'small'
    },
    {
      name: 'name',
      title: formatMessage({ id: 'RoleName' }),
      renderType: 'main'
    },
    {
      name: 'type',
      title: formatMessage({ id: 'SettingType' }),
      renderType: 'tag',
      getValueOf: ({ type }) => {
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
      renderType: 'description',
      ellipsis: true
    }
  ];
};

export default getColumns;
