import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { Flex, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';
import buildActionList from './Actions/buildActionList';
import Create from './Actions/Create';
import SendMessage from './Actions/SendMessage';
import UserMobileList from './UserMobileList';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';
import BizUnit from '@components/BizUnit';
import TablePageRender from '@components/BizUnit/TablePageRender';

import useFilterList from './useFilterList';
import useColumns from './useColumns';

/**
 * 将 URL 中的 userId 别名（filterUserId / id）归一到 userId，供 searchParamsValue 直接对齐筛选项 name。
 * TenantAdmin 详情页 URL 的 id 是租户 id，仅当 allowQueryIdForUserFilter 时才把 id 当作用户 id。
 */
const normalizeUserSearchParams = (searchParams, { allowQueryIdForUserFilter } = {}) => {
  const next = new URLSearchParams(searchParams);
  if (!next.get('userId')) {
    const alias = next.get('filterUserId') || (allowQueryIdForUserFilter ? next.get('id') : null);
    if (alias) {
      next.set('userId', alias);
    }
  }
  return next;
};

const UserList = createWithRemoteLoader({
  modules: ['components-core:TablePage@useSelectedRow', 'components-core:Filter', 'components-core:Global@usePreset']
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
      allowQueryIdForUserFilter,
      showLength,
      optionsColumn
    }) => {
      const [useSelectedRow, Filter, usePreset] = remoteModules;
      const mobileListRef = useRef([]);
      const { formatMessage } = useIntl();
      const {
        getFilterValue,
        createFilterValueMapper,
        useSearchParamsValue,
        multiSelectInterceptor,
        singleSelectInterceptor,
        fields: filterFields
      } = Filter;
      const { InputFilterItem, SuperSelectFilterItem, SelectTreeFilterItem } = filterFields;
      const { plugins } = usePreset();
      const [searchParams, setSearchParams] = useSearchParams();

      const selectedRow = useSelectedRow();
      const { selectedRowKeys, selectedRows, setSelectedRows, setSelectedRowKeys, type } = selectedRow;

      const clearSelection = useCallback(() => {
        setSelectedRows([]);
      }, [setSelectedRows]);

      const rowSelection = useMemo(
        () => ({
          type,
          selectedRowKeys,
          allowSelectedAll: true,
          onChange: keys => setSelectedRowKeys(keys, mobileListRef.current || [])
        }),
        [type, selectedRowKeys, setSelectedRowKeys]
      );

      const mapFilterValue = useMemo(() => {
        const mapper = createFilterValueMapper({
          userId: 'string',
          email: 'string',
          phone: 'string',
          roles: 'multi',
          tenantOrgId: 'single',
          synced: 'single'
        });
        return (filterValue, getFv) => {
          const value = mapper(filterValue, getFv || getFilterValue);
          if (value.userId != null && value.userId !== '') {
            value.id = value.userId;
            delete value.userId;
          }
          return { filter: value };
        };
      }, [createFilterValueMapper, getFilterValue]);

      const searchParamsFields = useMemo(
        () => [
          { name: 'tenantOrgId', label: formatMessage({ id: 'Department' }), labelKey: 'tenantOrgName' },
          { name: 'userId', label: formatMessage({ id: 'FilterUserId' }), labelKey: 'userName' }
        ],
        [formatMessage]
      );

      const [seedSearchParams] = useState(() =>
        normalizeUserSearchParams(searchParams, { allowQueryIdForUserFilter })
      );

      const stripUserListUrlParams = useCallback(
        (_next, opts) => {
          const real = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
          ['userId', 'filterUserId', 'userName', 'tenantOrgId', 'tenantOrgName'].forEach(key => {
            real.delete(key);
          });
          if (allowQueryIdForUserFilter) {
            real.delete('id');
          }
          setSearchParams(real, opts);
        },
        [setSearchParams, allowQueryIdForUserFilter]
      );

      const searchParamsValue = useMemo(
        () => ({
          searchParams: seedSearchParams,
          setSearchParams: stripUserListUrlParams,
          fields: searchParamsFields
        }),
        [seedSearchParams, stripUserListUrlParams, searchParamsFields]
      );

      const fromUrl = useSearchParamsValue({
        searchParams: seedSearchParams,
        fields: searchParamsFields
      });

      const [filter, setFilter] = useState(() => {
        const byName = Object.fromEntries((fromUrl || []).map(item => [item.name, item]));
        const items = [
          { name: 'status', label: formatMessage({ id: 'FilterStatus' }), value: { label: formatMessage({ id: 'Open' }), value: 'open' } }
        ];
        const userRaw = byName.userId;
        const userId = userRaw?.value?.value || initialUserId || null;
        if (userId) {
          items.push({
            name: 'userId',
            label: formatMessage({ id: 'FilterUserId' }),
            value: userRaw?.value || { label: String(userId), value: String(userId) }
          });
        }
        const orgEntry = byName.tenantOrgId;
        if (orgEntry) {
          const orgId = String(orgEntry.value.value).trim();
          const orgLabel = orgEntry.value.label != null ? String(orgEntry.value.label) : orgId;
          items.push({
            name: 'tenantOrgId',
            label: formatMessage({ id: 'Department' }),
            value: { label: orgLabel, value: orgId, id: orgId, name: orgLabel }
          });
        } else if (initialTenantOrgId) {
          const orgId = String(initialTenantOrgId).trim();
          const name = initialOrgName != null ? String(initialOrgName) : orgId;
          items.push({
            name: 'tenantOrgId',
            label: formatMessage({ id: 'Department' }),
            value: { label: name, value: orgId, id: orgId, name }
          });
        }
        return items;
      });

      const handleFilterChange = useCallback(
        next => {
          setFilter(next);
          clearSelection();
        },
        [clearSelection]
      );

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

      const renderCardsFactory = useCallback(
        (layout, reload) =>
          ({ dataSource } = {}) => (
            <UserMobileList
              layout={layout === 'card' ? 'card' : undefined}
              dataSource={dataSource ?? mobileListRef.current}
              rowSelection={rowSelection}
              apis={apis}
              getActions={getActions}
              onSuccess={reload}
              showLength={showLength}
            />
          ),
        [apis, getActions, rowSelection, showLength]
      );

      const buildButtonGroupList = useCallback(
        reload => {
          const list = [];
          if (apis.create) {
            list.push({
              buttonComponent: Create,
              type: 'primary',
              size: topOptionsSize,
              apis,
              onSuccess: reload,
              children: formatMessage({ id: 'Add' })
            });
          }
          if (apis.sendOrgMessage && hasExternalSelected) {
            list.push({
              buttonComponent: SendMessage,
              size: topOptionsSize,
              apis,
              selectedRows,
              onSuccess: () => {
                clearSelection();
                reload();
              }
            });
          }
          if (selectedRowKeys.length > 0) {
            list.push(({ key, className }) => (
              <Flex key={key} align="center" className={className} style={{ fontSize: 14, color: '#666', whiteSpace: 'nowrap' }}>
                {formatMessage({ id: 'SelectedCount' }, { count: selectedRowKeys.length })}
                <Button type="link" size="small" onClick={clearSelection}>
                  {formatMessage({ id: 'DeselectAll' })}
                </Button>
              </Flex>
            ));
          }
          return list;
        },
        [
          apis,
          hasExternalSelected,
          selectedRows,
          selectedRowKeys.length,
          topOptionsSize,
          clearSelection,
          formatMessage
        ]
      );

      const handlerMount = useRefCallback(() => {
        onMount?.({ filter: { value: filter, onChange: handleFilterChange }, filterList });
      });

      useEffect(() => {
        handlerMount();
      }, [handlerMount, selectedRowKeys]);

      const enhanceTableOptions = useCallback(
        tableOptions => {
          const reload = () =>
            tableOptions.ref?.current?.refresh?.({
              params: { currentPage: 1 }
            });
          const buttonList = buildButtonGroupList(reload);
          return Object.assign({}, tableOptions, {
            renderMobile: renderCardsFactory('mobile', reload),
            renderCard: renderCardsFactory('card', reload),
            ...(buttonList.length > 0 ? { buttonGroup: { list: buttonList } } : { buttonGroup: null })
          });
        },
        [renderCardsFactory, buildButtonGroupList]
      );

      return (
        <BizUnit
          name="tenant-user-list"
          apis={{ list: apis.list }}
          searchParamsValue={searchParamsValue}
          filter={{
            value: filter,
            onChange: handleFilterChange,
            list: filterList
          }}
          getColumns={() => columns}
          getActionList={({ data, className, ...props }) => {
            const list = buildActionList({ formatMessage, data, apis, className, ...props });
            const extended = typeof getActions === 'function' ? getActions({ list, data }) : null;
            return Array.isArray(extended) ? extended : list;
          }}
          options={{
            mapFilterValue,
            ...(Number.isInteger(showLength) ? { showLength } : {}),
            ...(optionsColumn ? { optionsColumn } : {}),
            tableProps: {
              pagination: { paramsType: 'params' },
              rowSelection,
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
              }
            }
          }}
        >
          {({ tableOptions, ...rest }) => {
            const nextOptions = enhanceTableOptions(tableOptions);
            if (typeof children === 'function') {
              return children({
                ...rest,
                tableOptions: nextOptions,
                filter: { value: filter, onChange: handleFilterChange },
                filterList
              });
            }
            return <TablePageRender tableOptions={nextOptions} />;
          }}
        </BizUnit>
      );
    }
  )
);

export default UserList;

export { default as TenantUserPersonalCard } from './UserPersonalCard';
