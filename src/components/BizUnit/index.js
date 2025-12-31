import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState, useEffect } from 'react';
import { Flex } from 'antd';
import useRefCallback from '@kne/use-ref-callback';
import merge from 'lodash/merge';
import Actions from './Actions';
import Create from './Actions/Create';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
const BizUnit = createWithRemoteLoader({
  modules: ['components-core:Table@TablePage', 'components-core:Filter']
})(
  withLocale(
    ({
      remoteModules,
      topOptionsSize,
      apis = {},
      name,
      children,
      getColumns,
      getFormInner,
      filterList = [],
      getActionList,
      allowKeywordSearch = true,
      onMount,
      options
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
          editButtonProps: {
            children: formatMessage({ id: 'Edit' })
          },
          removeButtonProps: {
            children: formatMessage({ id: 'Delete' })
          },
          openButtonProps: {
            children: formatMessage({ id: 'Open' })
          },
          closeButtonProps: {
            children: formatMessage({ id: 'Close' })
          },
          tableProps: {
            pagination: { paramsType: 'params' }
          }
        },
        options
      );
      const [TablePage, Filter] = remoteModules;
      const ref = useRef();
      const { SearchInput, getFilterValue } = Filter;
      const [filter, setFilter] = useState([]);
      const filterValue = getFilterValue(filter);
      const topOptions = (
        <Flex gap={8}>
          {allowKeywordSearch && <SearchInput size={topOptionsSize} name="keyword" label={formatMessage({ id: 'Keyword' })} />}
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
        </Flex>
      );

      const tableOptions = merge(
        {},
        options.tableProps,
        merge({}, apis.list, {
          params: {
            filter: filterValue
          }
        }),
        {
          ref,
          columns: [
            ...getColumns(),
            {
              name: 'options',
              type: 'options',
              title: formatMessage({ id: 'Operation' }),
              fixed: 'right',
              valueOf: item => {
                return {
                  children: (
                    <Actions
                      moreType="link"
                      data={item}
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
        }
      );

      const handlerMount = useRefCallback(() => {
        onMount && onMount({ filter: { value: filter, onChange: setFilter }, topOptions, tableOptions });
      });

      useEffect(() => {
        handlerMount();
      }, [handlerMount]);

      if (typeof children === 'function') {
        return children({
          filter: { value: filter, onChange: setFilter },
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

export default BizUnit;
