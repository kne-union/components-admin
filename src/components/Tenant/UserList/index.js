import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { Flex, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';
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

      const mapFilterValue = useMemo(() => {
        const mapper = createFilterValueMapper({
          userId: 'string',
          roles: 'multi',
          tenantOrgId: 'single',
          synced: 'single'
        });
        // 接口仍使用 filter.id；返回 { filter } 由 TablePage reload 合并进 params，勿在外层再抬升 params.filter
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
          // 基于当前 window search 清理，避免闭包绑死旧 searchParams 导致回调引用抖动
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

      // 仅解析首屏展示用；URL 清理交给 TablePage filter.searchParamsValue
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

      // 对齐 BizUnit 演示：筛选走 TablePage 内部 reload + mapFilterValue，不要把 filter 抬升进 list.params
      const tableOptions = {
        isNext: true,
        ...merge({}, apis.list),
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
          onChange: handleFilterChange,
          list: filterList,
          mapFilterValue,
          // TablePage 新 API：首包 merge + 清理 URL；字段名与筛选项对齐（userId / tenantOrgId）
          searchParamsValue
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
        onMount?.({ filter: { value: filter, onChange: handleFilterChange }, filterList, tableOptions });
      });

      // 仅挂载与勾选变化时通知；不要在每次筛选 onChange 时回调，避免外层连带重渲
      useEffect(() => {
        handlerMount();
      }, [handlerMount, selectedRowKeys]);

      if (typeof children === 'function') {
        return children({ filter: { value: filter, onChange: handleFilterChange }, filterList, tableOptions });
      }

      return <TablePage {...tableOptions} />;
    }
  )
);

export default UserList;

export { default as TenantUserPersonalCard } from './UserPersonalCard';
