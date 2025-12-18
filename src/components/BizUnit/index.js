import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState, useEffect } from 'react';
import { Flex } from 'antd';
import useRefCallback from '@kne/use-ref-callback';
import merge from 'lodash/merge';
import Actions from './Actions';
import Create from './Actions/Create';

const BizUnit = createWithRemoteLoader({
  modules: ['components-core:Table@TablePage', 'components-core:Filter']
})(({
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
  options = merge(
    {},
    {
      bizName: '',
      createButtonProps: {
        children: '添加',
        type: 'primary'
      },
      editButtonProps: {
        children: '编辑'
      },
      removeButtonProps: {
        children: '删除'
      },
      openButtonProps: {
        children: '开启'
      },
      closeButtonProps: {
        children: '关闭'
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
      {allowKeywordSearch && <SearchInput size={topOptionsSize} name="keyword" label="关键字" />}
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
          title: '操作',
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
      tableOptions
    });
  }
  return (
    <Flex vertical gap={8}>
      <Filter value={filter} onChange={setFilter} extra={topOptions} list={filterList} />
      <TablePage {...tableOptions} />
    </Flex>
  );
});

export default BizUnit;
