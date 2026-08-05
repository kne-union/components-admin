import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { transform } from 'lodash';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

import getColumns from '../getColumns';
import Menu from '../Menu';
import Actions from '../Actions';

const MyTask = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter', 'components-core:Enum']
})(
  withLocale(({ remoteModules, baseUrl, getManualTaskAction, pageProps = {} }) => {
    const [TablePage, usePreset, Filter, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const { apis, enums } = usePreset();
    const { getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem, TypeDateRangePickerFilterItem } = filterFields;
    const ref = useRef(null);
    const [filter, setFilter] = useState([
      {
        name: 'status',
        label: formatMessage({ id: 'Status' }),
        value: {
          value: 'pending',
          label: formatMessage({ id: 'PendingExecution' })
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
        isNext
        search={{
          name: 'targetName',
          label: formatMessage({ id: 'TargetName' })
        }}
        filter={{
          value: filter,
          onChange: setFilter,
          list: [
            {
              type: InputFilterItem,
              props: { label: formatMessage({ id: 'TaskID' }), name: 'id' }
            },
            {
              type: InputFilterItem,
              props: { label: formatMessage({ id: 'TargetID' }), name: 'targetId' }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                label: formatMessage({ id: 'Type' }),
                name: 'type',
                single: true,
                render: ({ children }) => {
                  return (
                    <Enum moduleName="taskType" format="option">
                      {options => children({ options })}
                    </Enum>
                  );
                }
              }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                label: formatMessage({ id: 'Status' }),
                name: 'status',
                single: true,
                render: ({ children }) => {
                  return (
                    <Enum moduleName="taskStatus" format="option">
                      {options => children({ options })}
                    </Enum>
                  );
                }
              }
            },
            {
              type: TypeDateRangePickerFilterItem,
              props: { label: formatMessage({ id: 'CreatedAt' }), name: 'createdAt', allowEmpty: [true, true] }
            },
            {
              type: TypeDateRangePickerFilterItem,
              props: { label: formatMessage({ id: 'CompletedAt' }), name: 'completedAt', allowEmpty: [true, true] }
            }
          ]
        }}
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
            renderType: 'options',
            fixed: 'right',
            getValueOf: item => {
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
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps,
        }}
      />
    );
  })
);

export default MyTask;
