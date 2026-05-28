import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useEffect, useMemo } from 'react';
import { Flex } from 'antd';
import Actions from './Actions';
import Create from './Actions/Create';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';

import useFilterList from './useFilterList';
import useColumns from './useColumns';
import useListApi from './useListApi';

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
      const tableRef = useRef();
      const { formatMessage } = useIntl();
      const {
        SearchInput, getFilterValue, createFilterValueMapper,
        useUrlFilter, createUrlFilterReader, multiSelectInterceptor, fields: filterFields
      } = Filter;
      const { InputFilterItem, AdvancedSelectFilterItem, SuperSelectFilterItem } = filterFields;
      const { plugins } = usePreset();

      const mapFilterValue = useMemo(() => createFilterValueMapper({
        id: 'string',
        roles: 'multi',
        tenantOrgId: 'single'
      }), [createFilterValueMapper]);

      const [filter, setFilter] = useUrlFilter({
        readUrlParams: (searchParams) => {
          const reader = createUrlFilterReader(searchParams);
          const tenantOrgEntry = reader.takeFilterEntry('tenantOrgId');
          let userEntry = reader.takeFilterEntry('userId');
          const filterUserEntry = reader.takeFilterEntry('filterUserId');
          if (!userEntry && filterUserEntry) {
            userEntry = filterUserEntry;
          }
          let idEntry = null;
          if (allowQueryIdForUserFilter) {
            idEntry = reader.takeFilterEntry('id');
          }
          const tenantOrgId = tenantOrgEntry?.value || initialTenantOrgId || null;
          const orgName = tenantOrgEntry?.label || initialOrgName || '';
          const userId = userEntry?.value || idEntry?.value || initialUserId || null;
          return {
            consumedKeys: reader.getConsumedKeys(),
            tenantOrgId,
            orgName,
            userId,
            tenantOrgEntry,
            userEntry: userId ? (userEntry || { label: String(userId), value: String(userId) }) : null
          };
        },
        buildFilter: ({ tenantOrgId, orgName, tenantOrgEntry, userEntry }) => {
          const items = [
            { name: 'status', label: formatMessage({ id: 'FilterStatus' }), value: { label: formatMessage({ id: 'Open' }), value: 'open' } }
          ];
          if (userEntry) {
            items.push({ name: 'id', label: formatMessage({ id: 'FilterUserId' }), value: userEntry });
          }
          if (tenantOrgEntry) {
            items.push({
              name: 'tenantOrgId',
              label: formatMessage({ id: 'Department' }),
              value: { ...tenantOrgEntry, id: tenantOrgEntry.value, name: tenantOrgEntry.label }
            });
          } else if (tenantOrgId) {
            const orgId = String(tenantOrgId).trim();
            const name = orgName != null ? String(orgName) : orgId;
            items.push({
              name: 'tenantOrgId',
              label: formatMessage({ id: 'Department' }),
              value: { label: name, value: orgId, id: orgId, name }
            });
          }
          return items;
        }
      });

      const filterValue = useMemo(() => mapFilterValue(filter, getFilterValue), [filter, getFilterValue, mapFilterValue]);
      const filterList = useFilterList({ formatMessage, apis, InputFilterItem, AdvancedSelectFilterItem, SuperSelectFilterItem, multiSelectInterceptor });
      const columns = useColumns({ formatMessage, apis, plugins });
      const listApi = useListApi({ apis, filterValue, ajax });

      const topOptions = (
        <Flex gap={8}>
          <SearchInput size={topOptionsSize} name="keyword" label={formatMessage({ id: 'Keyword' })} />
          {apis.create && (
            <Create type="primary" size={topOptionsSize} apis={apis} onSuccess={() => tableRef.current.reload()}>
              {formatMessage({ id: 'Add' })}
            </Create>
          )}
        </Flex>
      );

      const tableOptions = {
        ...listApi,
        ref: tableRef,
        columns: [
          ...columns,
          {
            name: 'options',
            type: 'options',
            title: formatMessage({ id: 'Operation' }),
            fixed: 'right',
            valueOf: item => ({
              children: (
                <Actions
                  itemClassName="btn-no-padding"
                  moreType="link"
                  data={item}
                  apis={apis}
                  onSuccess={() => tableRef.current.reload()}
                />
              )
            })
          }
        ],
        name: 'tenant-user-list',
        pagination: { paramsType: 'params' }
      };

      const handlerMount = useRefCallback(() => {
        onMount?.({ filter: { value: filter, onChange: setFilter }, filterList, topOptions, tableOptions });
      });

      useEffect(() => {
        handlerMount();
      }, [handlerMount, filter]);

      if (typeof children === 'function') {
        return children({ filter: { value: filter, onChange: setFilter }, filterList, topOptions, tableOptions });
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

export { default as TenantUserPersonalCard } from './UserPersonalCard';
