import { isManagedTenant } from '@components/Tenant';

const resolveTenantRowId = item => {
  const id = item?.id ?? item?.tenantId;
  if (id == null || id === '') {
    return null;
  }
  return String(id);
};

const goTenantDetail = (navigate, colItem) => {
  const id = resolveTenantRowId(colItem);
  if (!id || !navigate) {
    return;
  }
  navigate(`detail?id=${encodeURIComponent(id)}`);
};

const getColumns = ({ navigate, formatMessage }) => {
  return [
    {
      name: 'id',
      title: 'ID',
      renderType: 'id',
      onClick: ({ colItem }) => {
        goTenantDetail(navigate, colItem);
      }
    },
    {
      name: 'name',
      title: formatMessage({ id: 'Name' }),
      renderType: 'main',
      onClick: ({ colItem }) => {
        goTenantDetail(navigate, colItem);
      }
    },
    {
      name: 'status',
      title: formatMessage({ id: 'Status' }),
      renderType: 'tag',
      getValueOf: item => {
        return item.status === 'open' ? { type: 'success', text: formatMessage({ id: 'Open' }) } : { type: 'danger', text: formatMessage({ id: 'Close' }) };
      }
    },
    {
      name: 'source',
      title: formatMessage({ id: 'TenantSource' }),
      renderType: 'tag',
      getValueOf: item => {
        return isManagedTenant(item) ? { type: 'info', text: formatMessage({ id: 'ManagedByHost' }) } : { type: 'default', text: formatMessage({ id: 'LocalTenant' }) };
      }
    },
    {
      name: 'description',
      title: formatMessage({ id: 'Description' }),
      renderType: 'description',
      ellipsis: true
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'CreatedAt' }),
      format: 'datetime'
    }
  ];
};

export default getColumns;
