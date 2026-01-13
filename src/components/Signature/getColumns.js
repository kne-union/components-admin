const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'appId',
      title: 'AppId',
      type: 'other'
    },
    {
      name: 'secretKey',
      title: 'SecretKey',
      type: 'other'
    },
    {
      name: 'user',
      title: formatMessage({ id: 'BelongUser' }),
      type: 'other',
      valueOf: ({ user }) => {
        return user.nickname || user.email || user.phone;
      }
    },
    {
      name: 'description',
      title: formatMessage({ id: 'Description' }),
      type: 'description'
    },
    {
      name: 'lastVisitedAt',
      title: formatMessage({ id: 'LastVisitedAt' }),
      type: 'datetime'
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      type: 'tag',
      valueOf: (item, { name }) => {
        if (item[name] === 0) {
          return { type: 'success', text: formatMessage({ id: 'Enabled' }) };
        }
        return { type: 'danger', text: formatMessage({ id: 'Disabled' }) };
      }
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      type: 'datetime'
    }
  ];
};

export default getColumns;
