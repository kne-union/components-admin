import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { Flex, Button } from 'antd';
import Actions from './Actions';
import Create from './Actions/Create';
import SendMessage from './Actions/SendMessage';
import UserMobileList from './UserMobileList';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';

import useFilterList from './useFilterList';
import useColumns from './useColumns';
import get from 'lodash/get';

const UserList = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Table', 'components-core:Filter', 'components-core:Global@usePreset']
})(
  withLocale(
    ({
      remoteModules,
      apis,
      topOptionsSize,
      onMount,
      getActions,
      children,
      initialTenantOrgId,
      initialOrgName,
      initialUserId,
      allowQueryIdForUserFilter
    }) => {
      const [TablePage, Table, Filter, usePreset] = remoteModules;
      const { useSelectedRow } = Table;
      const tableRef = useRef();
      const mobileListRef = useRef([]);
      const { formatMessage } = useIntl();
      const {
        getFilterValue,
        createFilterValueMapper,
        useUrlFilter,
        createUrlFilterReader,
        multiSelectInterceptor,
        singleSelectInterceptor,
        fields: filterFields
      } = Filter;
      const { InputFilterItem, SuperSelectFilterItem, SelectTreeFilterItem } = filterFields;
      const { plugins } = usePreset();

      const selectedRow = useSelectedRow();
      const { selectedRowKeys, selectedRows, setSelectedRows, setSelectedRowKeys, type } = selectedRow;

      const clearSelection = useCallback(() => {
        setSelectedRows([]);
      }, [setSelectedRows]);

      // TableView 需要 onChange；用 ref 取当前页数据，避免闭包过期
      const rowSelection = useMemo(
        () => ({
          type,
          selectedRowKeys,
          allowSelectedAll: true,
          onChange: keys => setSelectedRowKeys(keys, mobileListRef.current || [])
        }),
        [type, selectedRowKeys, setSelectedRowKeys]
      );

      const mapFilterValue = useMemo(
        () =>
          createFilterValueMapper({
            id: 'string',
            roles: 'multi',
            tenantOrgId: 'single',
            synced: 'single'
          }),
        [createFilterValueMapper]
      );

      const [filter, setFilter] = useUrlFilter({
        readUrlParams: searchParams => {
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
            userEntry: userId ? userEntry || { label: String(userId), value: String(userId) } : null
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
      const filterList = useFilterList({
        formatMessage,
        apis,
        InputFilterItem,
        SuperSelectFilterItem,
        SelectTreeFilterItem,
        multiSelectInterceptor,
        singleSelectInterceptor
      });
      const columns = useColumns({ formatMessage, apis, plugins });

      const hasExternalSelected = selectedRows.some(row => row.syncSource);

      const buttonGroupList = [];
      if (apis.create) {
        buttonGroupList.push({
          buttonComponent: Create,
          type: 'primary',
          size: topOptionsSize,
          apis,
          onSuccess: () => tableRef.current.reload(),
          children: formatMessage({ id: 'Add' })
        });
      }
      if (apis.sendOrgMessage && hasExternalSelected) {
        buttonGroupList.push({
          buttonComponent: SendMessage,
          size: topOptionsSize,
          apis,
          selectedRows,
          onSuccess: () => {
            clearSelection();
            tableRef.current.reload();
          }
        });
      }
      if (selectedRowKeys.length > 0) {
        buttonGroupList.push(({ key, className }) => (
          <Flex key={key} align="center" className={className} style={{ fontSize: 14, color: '#666', whiteSpace: 'nowrap' }}>
            {formatMessage({ id: 'SelectedCount' }, { count: selectedRowKeys.length })}
            <Button type="link" size="small" onClick={clearSelection}>
              {formatMessage({ id: 'DeselectAll' })}
            </Button>
          </Flex>
        ));
      }

      const reloadTable = useCallback(() => {
        tableRef.current?.reload();
      }, []);

      const renderMobile = useCallback(
        ({ dataSource } = {}) => (
          <UserMobileList
            dataSource={dataSource ?? mobileListRef.current}
            rowSelection={rowSelection}
            apis={apis}
            getActions={getActions}
            onSuccess={reloadTable}
          />
        ),
        [apis, getActions, reloadTable, rowSelection]
      );

      const tableOptions = {
        isNext: true,
        ...merge({}, apis.list, {
          params: {
            filter: filterValue
          }
        }),
        dataFormat: data => {
          const format = typeof apis.list?.dataFormat === 'function' ? apis.list.dataFormat : null;
          const formatted = format
            ? format(data)
            : {
                list: data.pageData,
                total: data.totalCount ?? data.total,
                data
              };
          mobileListRef.current = formatted?.list || [];
          return formatted;
        },
        ref: tableRef,
        search: {
          name: 'keyword',
          label: formatMessage({ id: 'Keyword' })
        },
        filter: {
          value: filter,
          onChange: setFilter,
          list: filterList
        },
        columns: [
          ...columns,
          {
            name: 'options',
            title: formatMessage({ id: 'Operation' }),
            renderType: 'options',
            fixed: 'right',
            getValueOf: item => {
              return {
                children: (
                  <Actions itemClassName="btn-no-padding" moreType="link" data={item} apis={apis} onSuccess={reloadTable}>
                    {getActions}
                  </Actions>
                )
              };
            }
          }
        ],
        name: 'tenant-user-list',
        pagination: { paramsType: 'params' },
        rowSelection,
        renderMobile,
        ...(buttonGroupList.length > 0 ? { buttonGroup: { list: buttonGroupList } } : {})
      };

      const handlerMount = useRefCallback(() => {
        onMount?.({ filter: { value: filter, onChange: setFilter }, filterList, tableOptions });
      });

      useEffect(() => {
        handlerMount();
      }, [handlerMount, filter, selectedRowKeys]);

      if (typeof children === 'function') {
        return children({ filter: { value: filter, onChange: setFilter }, filterList, tableOptions });
      }

      return <TablePage {...tableOptions} />;
    }
  )
);

export default UserList;

export { default as TenantUserPersonalCard } from './UserPersonalCard';
