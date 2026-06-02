import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Flex } from 'antd';
import merge from 'lodash/merge';
import Actions from './Actions';
import Create from './Actions/Create';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import TablePageRender from './TablePageRender';
const BizUnit = createWithRemoteLoader({
  modules: ['components-core:Table@TablePage', 'components-core:Filter']
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
      filterList = [],
      getActionList,
      allowKeywordSearch = true,
      onMount,
      options,
      filter: outerFilter,
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
      const [TablePage, Filter] = remoteModules;
      const { SearchInput, getFilterValue, useUrlFilterValue } = Filter;
      const ref = useRef(null);
      const [urlFilter] = useUrlFilterValue(urlFilterValue || []);

      const [filter, setFilter] = useState(urlFilter);

      const filterValue = options.mapFilterValue ? options.mapFilterValue(filter, getFilterValue) : getFilterValue(filter);

      const topOptions = (
        <Flex gap={8}>
          {allowKeywordSearch && <SearchInput size={topOptionsSize} name={options.keywordFilterName} label={options.keywordFilterLabel} />}
          {apis.create && (
            <Create
              getFormInner={getFormInner}
              apis={apis}
              options={options}
              onSuccess={() => {
                tableOptions.ref.current.reload();
              }}
            />
          )}
          {titleExtra}
        </Flex>
      );

      const tableOptions = merge({}, options.tableProps, merge({}, apis.list, options.getFilterValue(filterValue)), {
        ref,
        columns: [
          ...getColumns(),
          {
            name: 'options',
            type: 'options',
            title: formatMessage({ id: 'Operation' }),
            fixed: 'right',
            valueOf: (item, fetchOptions) => {
              return {
                children: (
                  <Actions
                    moreType="link"
                    data={item}
                    fetchOptions={fetchOptions}
                    apis={apis}
                    options={options}
                    getActionList={getActionList}
                    getFormInner={getFormInner}
                    onSuccess={() => {
                      tableOptions.ref.current.reload();
                    }}
                  />
                )
              };
            }
          }
        ],
        name
      });

      if (typeof children === 'function') {
        return children({
          filter: { value: filter, onChange: setFilter, list: filterList },
          topOptions,
          titleExtra: (
            <Filter.FilterProvider value={filter} onChange={setFilter}>
              {topOptions}
            </Filter.FilterProvider>
          ),
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

BizUnit.TablePageRender = TablePageRender;
BizUnit.Actions = Actions;

export default BizUnit;

export { TablePageRender, Actions };
