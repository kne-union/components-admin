const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'name',
      title: formatMessage({ id: 'AppName' }),
      renderType: 'main',
      width: 180
    },
    {
      name: 'code',
      title: formatMessage({ id: 'AppCode' }),
      renderType: 'small',
      width: 140
    },
    {
      name: 'tenantMode',
      title: formatMessage({ id: 'TenantMode' }),
      renderType: 'tag',
      width: 140,
      getValueOf: item =>
        item.tenantMode === 'independent'
          ? { type: 'info', text: formatMessage({ id: 'TenantModeIndependent' }) }
          : { type: 'default', text: formatMessage({ id: 'TenantModeClient' }) }
    },
    {
      name: 'serviceClientId',
      title: formatMessage({ id: 'BoundClient' }),
      renderType: 'description',
      width: 200,
      getValueOf: item => [item.serviceClientId, ...(item.clientIds || [])].filter(Boolean).join(' / ')
    },
    {
      name: 'resource',
      title: formatMessage({ id: 'AppResource' }),
      renderType: 'small',
      width: 240,
      getValueOf: item => item.resource || '-'
    },
    {
      name: 'permissionCount',
      title: formatMessage({ id: 'PermissionCount' }),
      width: 100
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      renderType: 'tag',
      width: 100,
      getValueOf: item =>
        item.status === 'open'
          ? { type: 'success', text: formatMessage({ id: 'StatusOpen' }) }
          : { type: 'danger', text: formatMessage({ id: 'StatusClosed' }) }
    },
    {
      name: 'registeredAt',
      title: formatMessage({ id: 'RegisteredAt' }),
      format: 'datetime',
      width: 180
    }
  ];
};

export default getColumns;
