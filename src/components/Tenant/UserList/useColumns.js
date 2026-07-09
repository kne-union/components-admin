import { useMemo } from 'react';
import get from 'lodash/get';
import { Tag } from 'antd';
import UserOrgTags from './UserOrgTags';
import buildRolesTitle from '../Role/buildRolesTitle';

import { getSourceIcon, SOURCE_LABEL_MAP } from '../constants';

const getColumns = ({ formatMessage }) => {
  return [
    {
      name: 'id',
      title: 'ID',
      renderType: 'small'
    },
    {
      name: 'avatar',
      title: formatMessage({ id: 'Avatar' }),
      renderType: 'avatar',
      getValueOf: (item, { name }) => Object.assign({}, { id: item[name] })
    },
    {
      name: 'name',
      title: formatMessage({ id: 'UserName' }),
      renderType: 'main'
    },
    {
      name: 'roles',
      title: formatMessage({ id: 'UserRole' }),
      getValueOf: item => buildRolesTitle(item) || formatMessage({ id: 'DefaultRole' })
    },
    {
      name: 'tenantOrg',
      title: formatMessage({ id: 'Department' }),
      width: 260,
      disableColItem: true,
      getValueOf: item => <UserOrgTags item={item} />
    },
    {
      name: 'status',
      title: formatMessage({ id: 'FilterStatus' }),
      renderType: 'tag',
      getValueOf: item => ({
        type: item.status === 'open' ? 'success' : 'default',
        text: item.status === 'open' ? formatMessage({ id: 'Open' }) : formatMessage({ id: 'Close' })
      })
    },
    {
      name: 'syncSource',
      title: formatMessage({ id: 'IsSynced' }),
      getValueOf: item => {
        if (!item.syncSource) {
          return formatMessage({ id: 'SyncedInternal' });
        }
        const label = SOURCE_LABEL_MAP[item.syncSource] || item.syncSource;
        return (
          <Tag icon={getSourceIcon(item.syncSource)} color="processing">
            {label}
          </Tag>
        );
      }
    },
    {
      name: 'phone',
      title: formatMessage({ id: 'PhoneTitle' })
    },
    {
      name: 'email',
      title: formatMessage({ id: 'Email' })
    },
    {
      name: 'description',
      renderType: 'description',
      title: formatMessage({ id: 'UserDescription' }),
      ellipsis: true
    }
  ];
};

const useColumns = ({ formatMessage, apis, plugins }) => {
  return useMemo(() => {
    const getUserListColumns = get(plugins, 'tenantAdmin.getUserListColumns');
    const cols = getColumns({ formatMessage });
    if (typeof getUserListColumns === 'function') {
      return getUserListColumns({ columns: cols, apis });
    }
    return cols;
  }, [plugins, formatMessage, apis]);
};

export default useColumns;
