import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { Flex } from 'antd';
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
      urlFilterValue
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
      const { SearchInput, getFilterValue, useUrlFilterValue } = Filter;
      const ref = useRef(null);
      const [urlFilter] = useUrlFilterValue(urlFilterValue || []);

      const [filterValue, setFilterValue] = useState(urlFilter);

      const legacyFilterList = isTablePageFilterConfig(filterConfig) ? filterConfig.list : filterConfig;

      const filterValueForApi = options.mapFilterValue
        ? options.mapFilterValue(filterValue, getFilterValue)
        : getFilterValue(filterValue);

      const reloadTable = () => {
        ref.current?.reload();
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

      const resolveNextFilter = () => {
        if (!isTablePageFilterConfig(filterConfig)) {
          return null;
        }
        return merge(
          {},
          normalizeTableFilterConfig(filterConfig),
          urlFilterValue ? { defaultValue: urlFilter } : {},
          outerOnFilterChange ? { onChange: outerOnFilterChange } : {},
          options.mapFilterValue
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

      if (typeof children === 'function') {
        return children({
          isNext,
          filter: isNext
            ? nextFilter
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
