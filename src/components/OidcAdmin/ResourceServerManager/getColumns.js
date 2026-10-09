const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'name',
      title: formatMessage({ id: 'ResourceServerName' }),
      renderType: 'main',
      width: 180
    },
    {
      name: 'identifier',
      title: formatMessage({ id: 'Identifier' }),
      renderType: 'small',
      width: 260
    },
    {
      name: 'scope',
      title: formatMessage({ id: 'Scope' }),
      renderType: 'description',
      width: 200
    },
    {
      name: 'accessTokenTTL',
      title: formatMessage({ id: 'AccessTokenTTL' }),
      width: 160,
      getValueOf: item => item.accessTokenTTL || '-'
    },
    {
      name: 'includePermissions',
      title: formatMessage({ id: 'IncludePermissions' }),
      renderType: 'tag',
      width: 140,
      getValueOf: item =>
        item.includePermissions ? { type: 'success', text: formatMessage({ id: 'Yes' }) } : { type: 'default', text: formatMessage({ id: 'No' }) }
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      renderType: 'tag',
      width: 100,
      getValueOf: item =>
        item.status === 'open' ? { type: 'success', text: formatMessage({ id: 'StatusOpen' }) } : { type: 'danger', text: formatMessage({ id: 'StatusClosed' }) }
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      format: 'datetime',
      width: 180
    }
  ];
};

export default getColumns;
