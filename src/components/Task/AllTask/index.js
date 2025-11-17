import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { transform } from 'lodash';

import getColumns from '../getColumns';
import Menu from '../Menu';
import Actions from '../Actions';
import RetryTask from '../Actions/RetryTask';

const AllTask = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter', 'components-core:Tooltip']
})(({ remoteModules, baseUrl, getManualTaskAction }) => {
  const [TablePage, usePreset, Filter, Tooltip] = remoteModules;
  const { apis, enums } = usePreset();
  const { SearchInput, getFilterValue, fields: filterFields } = Filter;
  const { InputFilterItem, AdvancedSelectFilterItem, TypeDateRangePickerFilterItem } = filterFields;
  const ref = useRef(null);
  const [filter, setFilter] = useState([]);
  const [sort, setSortChange] = useState([]);
  const [selected, setSelected] = useState({
    selectedRowKeys: [],
    selectedRows: []
  });

  const filterValue = getFilterValue(filter);

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setSelected({ selectedRowKeys, selectedRows });
  };

  return (
    <TablePage
      {...Object.assign({}, apis.task.list, {
        params: {
          filter: Object.assign({}, filterValue, {
            createdAt: filterValue.createdAt
              ? {
                  startTime: filterValue.createdAt.value[0],
                  endTime: filterValue.createdAt.value[1]
                }
              : null,
            completedAt: filterValue.completedAt
              ? {
                  startTime: filterValue.completedAt.value[0],
                  endTime: filterValue.completedAt.value[1]
                }
              : null
          }),
          sort: transform(
            sort,
            (result, value) => {
              result[value.name] = value.sort;
            },
            {}
          )
        }
      })}
      ref={ref}
      pagination={{ paramsType: 'params' }}
      name="admin-task-all-list"
      sort={sort}
      onSortChange={setSortChange}
      columns={[
        ...getColumns(),
        {
          name: 'options',
          title: '操作',
          type: 'options',
          fixed: 'right',
          valueOf: item => {
            return {
              children: (
                <Actions
                  getManualTaskAction={getManualTaskAction}
                  data={item}
                  type="link"
                  onSuccess={() => {
                    ref.current.reload();
                  }}
                />
              )
            };
          }
        }
      ]}
      rowSelection={{
        type: 'checkbox',
        hideSelectAll: true,
        selectedRowKeys: selected.selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: record => {
          return {
            disabled: record.status !== 'failed' // Column configuration not to be checked
          };
        }
      }}
      topArea={
        <>
          已选：{selected.selectedRowKeys?.length}
          <Tooltip placement="topLeft" content="请选择要批量重试的任务，只能选择失败的任务">
            <RetryTask
              size="small"
              type="link"
              disabled={!selected.selectedRows?.length}
              taskIds={selected.selectedRowKeys}
              onSuccess={() => {
                setSelected({
                  selectedRowKeys: [],
                  selectedRows: []
                });
                ref.current?.reload?.();
              }}>
              批量重试
            </RetryTask>
            {/*<AddDigitalTask
              size="small"
              type="link"
              data={{ language: selected.selectedRows?.[0]?.language, hasProbe: true }}
              disabled={!selected.selectedRows?.length}
              questionIds={selected.selectedRowKeys}
              onSuccess={() => {
                setSelected({
                  selectedRowKeys: [],
                  selectedRows: []
                });
                ref.current?.reload?.();
              }}
            >
              批量添加数字人任务
            </AddDigitalTask>*/}
          </Tooltip>
        </>
      }
      page={{
        filter: {
          value: filter,
          onChange: setFilter,
          list: [
            [
              <InputFilterItem label="任务ID" name="id" />,
              <InputFilterItem label="目标ID" name="targetId" />,
              <AdvancedSelectFilterItem
                label="类型"
                name="type"
                single
                api={{
                  loader: () => {
                    return {
                      pageData: enums.taskType().map(item => ({ value: item.value, label: item.description }))
                    };
                  }
                }}
              />,
              <AdvancedSelectFilterItem
                label="状态"
                name="status"
                single
                api={{
                  loader: () => {
                    return {
                      pageData: enums.taskStatus().map(item => ({ value: item.value, label: item.description }))
                    };
                  }
                }}
              />,
              <AdvancedSelectFilterItem
                label="执行方式"
                name="runnerType"
                single
                api={{
                  loader: () => {
                    return {
                      pageData: [
                        { label: '手动执行', value: 'manual' },
                        { label: '自动执行', value: 'system' }
                      ]
                    };
                  }
                }}
              />,
              <TypeDateRangePickerFilterItem label="创建时间排序" name="createdAt" allowEmpty={[true, true]} />,
              <TypeDateRangePickerFilterItem label="完成时间排序" name="completedAt" allowEmpty={[true, true]} />
            ]
          ]
        },
        titleExtra: <SearchInput name="targetName" label="目标名称" />,
        menu: <Menu baseUrl={baseUrl} />
      }}
    />
  );
});

export default AllTask;
