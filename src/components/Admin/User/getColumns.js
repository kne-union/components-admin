const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'avatar',
      title: formatMessage({ id: 'Avatar' }),
      renderType: 'avatar',
      getValueOf: item => Object.assign({}, { gender: item['gender'] || 'M' }, { id: item.avatar })
    },
    {
      name: 'nickname',
      title: formatMessage({ id: 'Nickname' }),
      renderType: 'main'
    },
    {
      name: 'email',
      title: formatMessage({ id: 'Email' })
    },
    {
      name: 'phone',
      title: formatMessage({ id: 'Phone' })
    },
    {
      name: 'isSuperAdmin',
      title: formatMessage({ id: 'IsSuperAdmin' }),
      getValueOf: item => {
        return item.isSuperAdmin === true ? formatMessage({ id: 'Yes' }) : formatMessage({ id: 'No' });
      }
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      renderType: 'tag',
      getValueOf: item => {
        if (item.status === 0) {
          return { type: 'success', text: formatMessage({ id: 'Normal' }) };
        }
        if (item.status === 10) {
          return { text: formatMessage({ id: 'NotActivated' }) };
        }
        if (item.status === 11) {
          return { type: 'danger', text: formatMessage({ id: 'Disabled' }) };
        }
        if (item.status === 12) {
          return { type: 'danger', text: formatMessage({ id: 'Closed' }) };
        }

        return { text: formatMessage({ id: 'Other' }) };
      }
    },
    {
      name: 'description',
      title: formatMessage({ id: 'Description' }),
      renderType: 'description'
    }
  ];
};

export default getColumns;
