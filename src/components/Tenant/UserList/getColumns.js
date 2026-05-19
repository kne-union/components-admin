import UserOrgTags from './UserOrgTags';

const getColumns = ({ formatMessage }) => {
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
      type: 'other',
      width: 260,
      disableColItem: true,
      valueOf: item => <UserOrgTags item={item} />
    },
    {
      name: 'status',
      title: formatMessage({ id: 'FilterStatus' }),
      type: 'tag',
      valueOf: item => ({
        type: item.status === 'open' ? 'success' : 'default',
        text: item.status === 'open' ? formatMessage({ id: 'Open' }) : formatMessage({ id: 'Close' })
      })
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
