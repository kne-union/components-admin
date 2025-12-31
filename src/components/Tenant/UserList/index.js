import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState, useRef, useEffect, useMemo } from 'react';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Flex } from 'antd';
import getColumns from './getColumns';
import Actions from './Actions';
import Create from './Actions/Create';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import useRefCallback from '@kne/use-ref-callback';

const UserList = createWithRemoteLoader({
  modules: ['components-core:Table@TablePage', 'components-core:Filter', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, apis, topOptionsSize, onMount, children }) => {
    const [TablePage, Filter, usePreset] = remoteModules;
    const ref = useRef();
    const { formatMessage } = useIntl();
    const { SearchInput, FilterProvider, getFilterValue } = Filter;
    const [filter, setFilter] = useState([]);
    const filterValue = getFilterValue(filter);
    const { plugins } = usePreset();
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
      const columns = getColumns({ formatMessage });
      if (typeof getUserListColumns === 'function') {
        return getUserListColumns({ columns });
      }
      return columns;
    }, [plugins, formatMessage]);

    const tableOptions = {
      ...merge({}, apis.list, {
        params: {
          filter: filterValue
        }
      }),
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
      onMount && onMount({ filter: { value: filter, onChange: setFilter }, topOptions, tableOptions });
    });

    useEffect(() => {
      handlerMount();
    }, [handlerMount]);

    if (typeof children === 'function') {
      return children({
        filter: { value: filter, onChange: setFilter },
        topOptions,
        tableOptions
      });
    }

    return (
      <Flex vertical gap={8} flex={1}>
        <Flex justify="space-between">
          <div></div>
          <FilterProvider value={filter} onChange={setFilter}>
            {topOptions}
          </FilterProvider>
        </Flex>
        <TablePage {...tableOptions} />
      </Flex>
    );
  })
);

export default UserList;

export { default as UserCard } from './UserCard';
