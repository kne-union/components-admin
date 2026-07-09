const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'appId',
      title: 'AppId'
    },
    {
      name: 'secretKey',
      title: 'SecretKey'
    },
    {
      name: 'user',
      title: formatMessage({ id: 'BelongUser' }),
      getValueOf: ({ user }) => {
        return user.nickname || user.email || user.phone;
      }
    },
    {
      name: 'description',
      title: formatMessage({ id: 'Description' }),
      renderType: 'description'
    },
    {
      name: 'lastVisitedAt',
      title: formatMessage({ id: 'LastVisitedAt' }),
      format: 'datetime'
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      renderType: 'tag',
      getValueOf: item => {
        if (item.status === 0) {
          return { type: 'success', text: formatMessage({ id: 'Enabled' }) };
        }
        return { type: 'danger', text: formatMessage({ id: 'Disabled' }) };
      }
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      format: 'datetime'
    }
  ];
};

export default getColumns;
