const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'avatar',
      title: formatMessage({ id: 'Avatar' }),
      type: 'avatar',
      valueOf: (item, { name }) => Object.assign({}, { gender: item['gender'] || 'M' }, { id: item[name] })
    },
    {
      name: 'nickname',
      title: formatMessage({ id: 'Nickname' }),
      type: 'mainInfo'
    },
    {
      name: 'email',
      title: formatMessage({ id: 'Email' }),
      type: 'other'
    },
    {
      name: 'phone',
      title: formatMessage({ id: 'Phone' }),
      type: 'serialNumber'
    },
    {
      name: 'isSuperAdmin',
      title: formatMessage({ id: 'IsSuperAdmin' }),
      type: 'other',
      valueOf: (item, { name }) => {
        return item[name] === true ? formatMessage({ id: 'Yes' }) : formatMessage({ id: 'No' });
      }
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      type: 'tag',
      valueOf: (item, { name }) => {
        if (item[name] === 0) {
          return { type: 'success', text: formatMessage({ id: 'Normal' }) };
        }
        if (item[name] === 10) {
          return { text: formatMessage({ id: 'NotActivated' }) };
        }
        if (item[name] === 11) {
          return { type: 'danger', text: formatMessage({ id: 'Disabled' }) };
        }
        if (item[name] === 12) {
          return { type: 'danger', text: formatMessage({ id: 'Closed' }) };
        }

        return { text: formatMessage({ id: 'Other' }) };
      }
    },
    {
      name: 'description',
      title: formatMessage({ id: 'Description' }),
      type: 'description'
    }
  ];
};

export default getColumns;
