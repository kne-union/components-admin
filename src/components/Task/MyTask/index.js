import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { transform } from 'lodash';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

import getColumns from '../getColumns';
import Menu from '../Menu';
import Actions from '../Actions';

const MyTask = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter']
})(withLocale(({ remoteModules, baseUrl, getManualTaskAction }) => {
  const [TablePage, usePreset, Filter] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, enums } = usePreset();
  const { SearchInput, getFilterValue, fields: filterFields } = Filter;
  const { InputFilterItem, AdvancedSelectFilterItem, TypeDateRangePickerFilterItem } = filterFields;
  const ref = useRef(null);
  const [filter, setFilter] = useState([
    {
      name: 'status',
      label: formatMessage({ id: 'Status' }),
      value: {
        value: 'pending',
        label: formatMessage({ id: 'Pending' })
      }
    }
  ]);
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
              : null,
            runnerType: 'manual'
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
      name="admin-task-my-list"
      sort={sort}
      onSortChange={setSortChange}
      columns={[
        ...getColumns({ formatMessage }),
        {
          name: 'options',
          title: formatMessage({ id: 'Operation' }),
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
      page={{
        filter: {
          value: filter,
          onChange: setFilter,
          list: [
            [
              <InputFilterItem label={formatMessage({ id: 'TaskID' })} name="id" />,
              <InputFilterItem label={formatMessage({ id: 'TargetID' })} name="targetId" />,
              <AdvancedSelectFilterItem
                label={formatMessage({ id: 'Type' })}
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
                label={formatMessage({ id: 'Status' })}
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
              <TypeDateRangePickerFilterItem label={formatMessage({ id: 'CreatedAt' })} name="createdAt" allowEmpty={[true, true]} />,
              <TypeDateRangePickerFilterItem label={formatMessage({ id: 'CompletedAt' })} name="completedAt" allowEmpty={[true, true]} />
            ]
          ]
        },
        titleExtra: <SearchInput name="targetName" label={formatMessage({ id: 'TargetName' })} />,
        menu: <Menu baseUrl={baseUrl} />
      }}
    />
  );
}));

export default MyTask;
