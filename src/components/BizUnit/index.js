import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState, useMemo, useCallback } from 'react';
import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import merge from 'lodash/merge';
import Create from './Actions/Create';
import Actions from './Actions';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import TablePageRender from './TablePageRender';
import buildOptionsColumn from './buildOptionsColumn';

const isTablePageFilterConfig = value =>
  value != null && typeof value === 'object' && !Array.isArray(value) && Array.isArray(value.list);

const normalizeTableFilterList = list => {
  if (!Array.isArray(list)) {
    return list;
  }
  if (list.length > 0 && Array.isArray(list[0])) {
    return list.flat();
  }
  return list;
};

const normalizeTableFilterConfig = filterConfig => {
  const { displayLine, list, ...rest } = filterConfig;
  return Object.assign({}, rest, {
    list: normalizeTableFilterList(list)
  });
};

/** 归一 field：保留 name / label / labelKey */
const normalizeSearchParamsField = item => {
  if (typeof item === 'string') {
    return { name: item, label: item };
  }
  const next = { name: item.name, label: item.label || item.name };
  if (item.labelKey) {
    next.labelKey = item.labelKey;
  }
  return next;
};

/** 归一 searchParamsValue：支持 fields 数组简写，或与 Filter 同参的对象 */
const normalizeSearchParamsValueProp = prop => {
  if (!prop) {
    return null;
  }
  if (Array.isArray(prop)) {
    return {
      fields: prop.map(normalizeSearchParamsField)
    };
  }
  if (typeof prop === 'object') {
    const fields = Array.isArray(prop.fields) ? prop.fields : [];
    return {
      fields: fields.map(normalizeSearchParamsField),
      searchParams: prop.searchParams,
      setSearchParams: prop.setSearchParams
    };
  }
  return null;
};

/** 仅序列化 fields 描述，忽略 searchParams 实例引用，避免父级每次 render 传入新数组导致下游 filter 引用抖动 */
const serializeSearchParamsFieldsKey = prop => {
  if (!prop) {
    return '';
  }
  const fields = Array.isArray(prop) ? prop : Array.isArray(prop.fields) ? prop.fields : [];
  return JSON.stringify(
    fields.map(item => {
      if (typeof item === 'string') {
        return { name: item, label: item };
      }
      return { name: item?.name, label: item?.label || item?.name, labelKey: item?.labelKey };
    })
  );
};

const readWindowSearchParams = () => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

const BizUnit = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Table@TablePage', 'components-core:Filter']
})(
  withLocale(
    ({
      remoteModules,
      topOptionsSize,
      apis = {},
      name,
      titleExtra = null,
      children,
      getColumns,
      getFormInner,
      filter,
      filterList,
      getActionList,
      allowKeywordSearch = true,
      isNext = false,
      page,
      options,
      onFilterChange: outerOnFilterChange,
      searchParamsValue: searchParamsValueProp
    }) => {
      const { formatMessage } = useIntl();
      options = merge(
        {},
        {
          bizName: '',
          createButtonProps: {
            children: formatMessage({ id: 'Add' }),
            type: 'primary'
          },
          tableProps: {
            pagination: { paramsType: 'params' }
          },
          keywordFilterName: 'keyword',
          keywordFilterLabel: formatMessage({ id: 'Keyword' }),
          mapFilterValue: null,
          getFilterValue: filterValue => ({
            params: {
              filter: filterValue
            }
          })
        },
        options
      );
      const filterConfig = filter ?? filterList ?? [];
      const [LayoutTablePage, LegacyTablePage, Filter] = remoteModules;
      const TablePage = isNext ? LayoutTablePage : LegacyTablePage;
      const { SearchInput, getFilterValue, useSearchParamsValue } = Filter;
      const ref = useRef(null);
      const navigate = useNavigate();

      // 不要用 useSearchParams()：筛选/分页写 URL 会迫使 BizUnit 整树重渲染，
      // children 里的 TablePage 被反复换 props，表现为表格区域卸载白屏。
      const searchFieldsKey = serializeSearchParamsFieldsKey(searchParamsValueProp);
      const normalizedSearchParamsValue = useMemo(
        () => normalizeSearchParamsValueProp(searchParamsValueProp),
        // 只在 fields 描述变化时重算；忽略父级每次 render 的新数组引用
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchFieldsKey]
      );
      const searchFields = normalizedSearchParamsValue?.fields || [];
      const initialSearchParamsRef = useRef(null);
      if (initialSearchParamsRef.current === null) {
        initialSearchParamsRef.current = normalizedSearchParamsValue?.searchParams || readWindowSearchParams();
      }
      const resolvedSetSearchParams = useCallback(
        (next, opts) => {
          if (typeof normalizedSearchParamsValue?.setSearchParams === 'function') {
            return normalizedSearchParamsValue.setSearchParams(next, opts);
          }
          const current = readWindowSearchParams();
          const resolved = typeof next === 'function' ? next(current) : next;
          const raw = resolved && typeof resolved.toString === 'function' ? resolved.toString() : '';
          const search = raw ? `?${raw.replace(/^\?/, '')}` : '';
          navigate({ search }, { replace: opts?.replace !== false });
        },
        [navigate, normalizedSearchParamsValue?.setSearchParams]
      );

      // isNext 时由 TablePage filter.searchParamsValue 负责解析与清理；legacy 仍用 hook seed
      const fromSearchParams = useSearchParamsValue({
        searchParams: initialSearchParamsRef.current,
        setSearchParams: isNext ? undefined : resolvedSetSearchParams,
        fields: searchFields
      });

      const [filterValue, setFilterValue] = useState(fromSearchParams);

      const legacyFilterList = isTablePageFilterConfig(filterConfig) ? filterConfig.list : filterConfig;

      const filterValueForApi = options.mapFilterValue
        ? options.mapFilterValue(filterValue, getFilterValue)
        : getFilterValue(filterValue);

      const reloadTable = () => {
        const pagination = options.tableProps?.pagination || {};
        const paramsType = pagination.paramsType || 'params';
        const currentName = pagination.currentName || 'currentPage';
        // reload 会保留 ScrollLoader，触底计数用尽后无法再下拉；refresh 卸掉子树以重置分页与加载器
        ref.current?.refresh({
          [paramsType]: {
            [currentName]: 1
          }
        });
      };

      const toolbarExtra = (
        <Flex gap={8}>
          {apis.create && (
            <Create
              getFormInner={getFormInner}
              apis={apis}
              options={options}
              onSuccess={reloadTable}
            />
          )}
          {titleExtra}
        </Flex>
      );

      // isNext: 操作放到 TablePage 工具栏 buttonGroup（桌面端在 SearchInput 右侧，移动端为底部 ButtonFooter）
      const resolveNextButtonGroup = () => {
        const list = [];
        if (apis.create) {
          list.push({
            buttonComponent: Create,
            apis,
            options,
            getFormInner,
            onSuccess: reloadTable
          });
        }
        if (titleExtra) {
          list.push(({ key, className }) => (
            <Flex key={key} gap={8} align="center" className={className}>
              {titleExtra}
            </Flex>
          ));
        }
        const userButtonGroup = options.tableProps?.buttonGroup;
        const userList = Array.isArray(userButtonGroup?.list) ? userButtonGroup.list : [];
        const mergedList = [...list, ...userList];
        if (mergedList.length === 0) {
          return null;
        }
        return Object.assign({}, userButtonGroup, { list: mergedList });
      };

      const nextButtonGroup = isNext ? resolveNextButtonGroup() : null;

      const topOptions = (
        <Flex gap={8}>
          {allowKeywordSearch && <SearchInput size={topOptionsSize} name={options.keywordFilterName} label={options.keywordFilterLabel} />}
          {toolbarExtra}
        </Flex>
      );

      // 挂载期 snapshot，避免 URL 变化时换 searchParams 引用 → filter 引用抖动 → 下游卸载
      const searchParamsValueConfig = useMemo(() => {
        if (!searchFields.length) {
          return null;
        }
        return {
          searchParams: initialSearchParamsRef.current,
          setSearchParams: resolvedSetSearchParams,
          fields: searchFields
        };
      }, [searchFields, resolvedSetSearchParams]);

      /**
       * isNext 筛选项来源：顶层 filter/filterList，或 options.tableProps.filter（业务更常见）。
       * 原先只认顶层 filter，导致 BizUnit.searchParamsValue 配了也不进 TablePage。
       */
      const resolveNextFilterBase = () => {
        if (isTablePageFilterConfig(filterConfig)) {
          return filterConfig;
        }
        if (isTablePageFilterConfig(options.tableProps?.filter)) {
          return options.tableProps.filter;
        }
        return null;
      };

      const resolveNextFilter = () => {
        const baseFilter = resolveNextFilterBase();
        // 仅有 options.mapFilterValue（无筛选项 / URL 种子）时也要挂到 TablePage：
        // 否则 reload 会走默认 getFilterValue([])，把 apis.list.params.filter 里的固定字段清掉
        if (!baseFilter && !searchParamsValueConfig && !options.mapFilterValue) {
          return null;
        }
        return merge(
          {},
          baseFilter ? normalizeTableFilterConfig(baseFilter) : { list: [] },
          searchParamsValueConfig ? { searchParamsValue: searchParamsValueConfig } : {},
          outerOnFilterChange ? { onChange: outerOnFilterChange } : {},
          // tableProps.filter 已带 mapFilterValue 时不要用 options.mapFilterValue 覆盖（否则清空筛选会丢自定义清参逻辑）
          options.mapFilterValue && typeof baseFilter?.mapFilterValue !== 'function'
            ? {
                mapFilterValue: (value, getFv) => options.mapFilterValue(value, getFv || getFilterValue)
              }
            : {}
        );
      };

      const nextFilter = isNext ? resolveNextFilter() : null;

      const nextTableProps = isNext
        ? {
            isNext: true,
            dataFormat: data => ({
              list: data.pageData,
              total: data.totalCount ?? data.total,
              data
            }),
            pagination: merge(
              {
                open: true,
                showSizeChanger: true,
                showQuickJumper: true
              },
              options.tableProps?.pagination
            ),
            ...(allowKeywordSearch
              ? {
                  search: {
                    name: options.keywordFilterName,
                    label: options.keywordFilterLabel
                  }
                }
              : {}),
            ...(nextFilter ? { filter: nextFilter } : {}),
            page: merge({}, page)
          }
        : {};

      // lodash/merge 会深拷贝 ref（{ current }），导致 TablePage 绑到克隆对象上，
      // reloadTable 读到的仍是原始 useRef（current 一直为 null），增删改后列表不刷新。
      const tableOptions = Object.assign(
        merge(
          {},
          isNext ? {} : options.tableProps,
          isNext ? apis.list : merge({}, apis.list, options.getFilterValue(filterValueForApi)),
          nextTableProps,
          isNext ? options.tableProps : {},
          {
            columns: [
              ...getColumns(),
              buildOptionsColumn({
                isNext,
                formatMessage,
                apis,
                options,
                getActionList,
                getFormInner,
                onReload: reloadTable
              })
            ],
            name
          }
        ),
        { ref },
        // buttonGroup.list 不能走 lodash/merge（数组按下标深合并会破坏配置），在此整体覆盖
        isNext ? { buttonGroup: nextButtonGroup } : {}
      );

      // options.tableProps 后合并可能冲掉 searchParamsValue；最终再挂回，保证 URL 种子进 TablePage
      if (isNext && searchParamsValueConfig) {
        const mergedFilter = isTablePageFilterConfig(tableOptions.filter)
          ? normalizeTableFilterConfig(tableOptions.filter)
          : { list: Array.isArray(tableOptions.filter?.list) ? tableOptions.filter.list : [] };
        tableOptions.filter = Object.assign({}, mergedFilter, {
          searchParamsValue: searchParamsValueConfig
        });
      }

      if (typeof children === 'function') {
        return children({
          isNext,
          filter: isNext
            ? tableOptions.filter || nextFilter
            : { value: filterValue, onChange: setFilterValue, list: legacyFilterList },
          // isNext 时操作已并入 tableOptions.buttonGroup，不再单独提供顶部节点，避免重复渲染
          topOptions: isNext ? null : topOptions,
          titleExtra: isNext ? null : (
            <Filter.FilterProvider value={filterValue} onChange={setFilterValue}>
              {topOptions}
            </Filter.FilterProvider>
          ),
          tableOptions
        });
      }

      if (isNext) {
        return <TablePage {...tableOptions} />;
      }

      return (
        <Flex vertical gap={8} flex={1}>
          <Filter value={filterValue} onChange={setFilterValue} extra={topOptions} list={legacyFilterList} />
          <TablePage {...tableOptions} />
        </Flex>
      );
    }
  )
);

BizUnit.TablePageRender = TablePageRender;
BizUnit.Actions = Actions;

export default BizUnit;

export { default as TablePageRender } from './TablePageRender';
export { default as Actions } from './Actions';
