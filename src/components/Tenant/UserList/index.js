import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Flex } from 'antd';
import getColumns from './getColumns';
import Actions from './Actions';
import Create from './Actions/Create';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';
import DepartmentTreeFilterItem from './DepartmentTreeFilterItem';
import getUserListFilterValue from './getUserListFilterValue';
import buildUserListFilterFromSearch from './buildUserListFilterFromSearch';
import { readUserListUrlFilters, stripUserListUrlFilterKeys } from './userListUrlFilters';
import { buildUserListWithPositionList, extractListBody } from './buildUserListWithPositionList';

const UserList = createWithRemoteLoader({
  modules: ['components-core:Table@TablePage', 'components-core:Filter', 'components-core:Global@usePreset']
})(
  withLocale(
    ({
      remoteModules,
      apis,
      topOptionsSize,
      onMount,
      children,
      initialTenantOrgId,
      initialOrgName,
      initialUserId,
      allowQueryIdForUserFilter
    }) => {
      const [TablePage, Filter, usePreset] = remoteModules;
      const { ajax } = usePreset();
      const ref = useRef();
      const { formatMessage } = useIntl();
      const { SearchInput, FilterProvider, getFilterValue, fields: filterFields } = Filter;
      const { InputFilterItem, AdvancedSelectFilterItem, SuperSelectFilterItem } = filterFields;
      const { plugins } = usePreset();
      const [positionList, setPositionList] = useState([]);

      const [searchParams, setSearchParams] = useSearchParams();
      const urlFilterSnapshotRef = useRef(null);
      if (urlFilterSnapshotRef.current === null) {
        urlFilterSnapshotRef.current = readUserListUrlFilters(searchParams, {
          initialTenantOrgId,
          initialOrgName,
          initialUserId,
          allowQueryIdForUserFilter
        });
      }

      const [filter, setFilter] = useState(() =>
        buildUserListFilterFromSearch({
          formatMessage,
          ...urlFilterSnapshotRef.current
        })
      );

      const urlStrippedRef = useRef(false);
      useEffect(() => {
        if (urlStrippedRef.current) {
          return;
        }
        urlStrippedRef.current = true;
        const nextParams = stripUserListUrlFilterKeys(searchParams, urlFilterSnapshotRef.current?.consumedKeys);
        if (nextParams) {
          setSearchParams(nextParams, { replace: true });
        }
      }, [searchParams, setSearchParams]);

      const filterValue = useMemo(() => getUserListFilterValue(filter, getFilterValue), [filter, getFilterValue]);

      const filterList = useMemo(
        () => [
          [
            <InputFilterItem key="id" label={formatMessage({ id: 'FilterUserId' })} name="id" />,
            <SuperSelectFilterItem
              key="roles"
              label={formatMessage({ id: 'UserRole' })}
              name="roles"
              valueKey="id"
              labelKey="name"
              api={merge({}, apis.roleList, {
                params: {
                  filter: { status: 'open' },
                  ...(apis.roleList?.params || {})
                },
                transformData: data =>
                  Object.assign({}, data, {
                    pageData: (data.pageData || []).filter(
                      item => !(item.type === 'system' && item.code === 'default')
                    )
                  })
              })}
            />,
            <DepartmentTreeFilterItem
              key="tenantOrgId"
              label={formatMessage({ id: 'Department' })}
              name="tenantOrgId"
              api={merge({}, apis.orgList, { params: apis.orgList?.params || {} })}
            />,
            <AdvancedSelectFilterItem
              key="status"
              label={formatMessage({ id: 'FilterStatus' })}
              name="status"
              single
              api={{
                loader: () => ({
                  pageData: [
                    { label: formatMessage({ id: 'Open' }), value: 'open' },
                    { label: formatMessage({ id: 'Close' }), value: 'closed' }
                  ]
                })
              }}
            />
          ]
        ],
        [
          formatMessage,
          apis.roleList,
          apis.orgList,
          InputFilterItem,
          AdvancedSelectFilterItem,
          SuperSelectFilterItem,
          DepartmentTreeFilterItem
        ]
      );

      const topOptions = (
        <Flex gap={8}>
          <SearchInput size={topOptionsSize} name="keyword" label={formatMessage({ id: 'Keyword' })} />
          {apis.create && (
            <Create
              type="primary"
              size={topOptionsSize}
              apis={apis}
              onSuccess={() => {
                ref.current.reload();
              }}>
              {formatMessage({ id: 'Add' })}
            </Create>
          )}
        </Flex>
      );

      const columns = useMemo(() => {
        const getUserListColumns = get(plugins, 'tenantAdmin.getUserListColumns');
        const cols = getColumns({ formatMessage });
        if (typeof getUserListColumns === 'function') {
          return getUserListColumns({ columns: cols, apis });
        }
        return cols;
      }, [plugins, formatMessage, apis]);

      const listApi = useMemo(() => {
        const baseApi = buildUserListWithPositionList(
          merge({}, apis.list, {
            params: {
              filter: filterValue,
              ...(apis.list?.params || {})
            }
          }),
          apis.positionList,
          ajax
        );
        const loadList = baseApi.loader
          ? (...args) => baseApi.loader(...args)
          : async () => extractListBody(await ajax(merge({}, baseApi)));
        return Object.assign({}, baseApi, {
          loader: async (...args) => {
            const body = (await loadList(...args)) || {};
            setPositionList(body.positionList || []);
            return body;
          }
        });
      }, [apis.list, apis.positionList, filterValue, ajax]);

      const tableOptions = {
        ...listApi,
        ref,
        columns: [
          ...columns,
          {
            name: 'options',
            type: 'options',
            title: formatMessage({ id: 'Operation' }),
            fixed: 'right',
            valueOf: item => {
              return {
                children: (
                  <Actions
                    itemClassName="btn-no-padding"
                    moreType="link"
                    data={item}
                    apis={apis}
                    positionList={positionList}
                    onSuccess={() => {
                      ref.current.reload();
                    }}
                  />
                )
              };
            }
          }
        ],
        name: 'tenant-user-list',
        pagination: { paramsType: 'params' }
      };

      const handlerMount = useRefCallback(() => {
        onMount &&
          onMount({
            filter: { value: filter, onChange: setFilter },
            filterList,
            topOptions,
            tableOptions
          });
      });

      useEffect(() => {
        handlerMount();
      }, [handlerMount]);

      if (typeof children === 'function') {
        return children({
          filter: { value: filter, onChange: setFilter },
          filterList,
          topOptions,
          tableOptions
        });
      }

      return (
        <Flex vertical gap={8} flex={1}>
          <Filter value={filter} onChange={setFilter} extra={topOptions} list={filterList} />
          <TablePage {...tableOptions} />
        </Flex>
      );
    }
  )
);

export default UserList;

export { default as UserCard } from './UserCard';
export { default as TenantUserPersonalCard } from './TenantUserPersonalCard';
export { default as buildTenantUserPersonalCardProps } from './buildTenantUserPersonalCardProps';
export { default as buildInvitePersonalCardProps } from './Actions/buildInvitePersonalCardProps';
