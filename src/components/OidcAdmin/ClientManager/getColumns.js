import { isConfidential } from './utils';

const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'clientName',
      title: formatMessage({ id: 'ClientName' }),
      renderType: 'main',
      width: 180
    },
    {
      name: 'clientId',
      title: formatMessage({ id: 'ClientId' }),
      renderType: 'small',
      width: 200
    },
    {
      name: 'clientType',
      title: formatMessage({ id: 'ClientType' }),
      renderType: 'tag',
      width: 100,
      getValueOf: item =>
        isConfidential(item)
          ? { type: 'warning', text: formatMessage({ id: 'ClientTypeConfidentialShort' }) }
          : { type: 'info', text: formatMessage({ id: 'ClientTypePublicShort' }) }
    },
    {
      name: 'grantTypes',
      title: formatMessage({ id: 'GrantTypes' }),
      renderType: 'description',
      width: 220,
      getValueOf: item => (item.metadata?.grant_types || []).join(', ')
    },
    {
      name: 'allowedResources',
      title: formatMessage({ id: 'AllowedResources' }),
      renderType: 'description',
      width: 240,
      getValueOf: item => (item.allowedResources || []).join(', ')
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
