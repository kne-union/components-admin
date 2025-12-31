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
      name: 'avatar',
      title: formatMessage({ id: 'Avatar' }),
      type: 'avatar',
      valueOf: (item, { name }) => Object.assign({}, { id: item[name] })
    },
    {
      name: 'name',
      title: formatMessage({ id: 'UserName' }),
      type: 'mainInfo',
      primary: false,
      hover: false
    },
    {
      name: 'phone',
      title: formatMessage({ id: 'PhoneTitle' }),
      type: 'other'
    },
    {
      name: 'email',
      title: formatMessage({ id: 'Email' }),
      type: 'other'
    },
    {
      name: 'roles',
      title: formatMessage({ id: 'UserRole' }),
      valueOf: item => {
        return item.roles.map(item => item.name).join(',') || formatMessage({ id: 'DefaultRole' });
      }
    },
    {
      name: 'tenantOrg',
      title: formatMessage({ id: 'Department' }),
      valueOf: item => {
        return item.tenantOrg?.name;
      }
    },
    {
      name: 'description',
      type: 'description',
      title: formatMessage({ id: 'UserDescription' }),
      ellipsis: true
    }
  ];
};

export default getColumns;
