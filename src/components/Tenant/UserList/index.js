import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState, useRef } from 'react';
import merge from 'lodash/merge';
import { Flex, Button } from 'antd';
import getColumns from './getColumns';
import Actions from './Actions';
import Create from './Actions/Create';

const UserList = createWithRemoteLoader({
  modules: ['components-core:Table@TablePage', 'components-core:Filter']
})(({ remoteModules, apis, topOptionsSize, children }) => {
  const [TablePage, Filter] = remoteModules;
  const ref = useRef();
  const { SearchInput, FilterProvider, getFilterValue } = Filter;
  const [filter, setFilter] = useState([]);
  const filterValue = getFilterValue(filter);
  const topOptions = (
    <Flex gap={8}>
      <SearchInput size={topOptionsSize} name="keyword" label="关键字" />
      <Create
        type="primary"
        size={topOptionsSize}
        apis={apis}
        onSuccess={() => {
          ref.current.reload();
        }}
      >
        添加
      </Create>
    </Flex>
  );

  const tableOptions = {
    ...merge({}, apis.list, {
      params: {
        filter: filterValue
      }
    }),
    ref,
    columns: [
      ...getColumns(),
      {
        name: 'options',
        type: 'options',
        title: '操作',
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

  if (typeof children === 'function') {
    return children({
      filter,
      topOptions,
      tableOptions
    });
  }

  return (
    <Flex vertical gap={8}>
      <Flex justify="space-between">
        <div></div>
        <FilterProvider value={filter} onChange={setFilter}>
          {topOptions}
        </FilterProvider>
      </Flex>
      <TablePage {...tableOptions} />
    </Flex>
  );
});

export default UserList;

export { default as UserCard } from './UserCard';
