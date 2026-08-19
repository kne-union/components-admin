import { createWithRemoteLoader } from '@kne/remote-loader';
import { useCallback, useMemo, useRef, useState } from 'react';
import { App } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

import getColumns from '../getColumns';
import Menu from '../Menu';
import Actions from '../Actions';
import { createTaskMapFilterValue } from '../filterUtils';

const AllTask = createWithRemoteLoader({
  modules: [
    'components-core:Layout@TablePage',
    'components-core:TablePage@Table',
    'components-core:Global@usePreset',
    'components-core:Filter',
    'components-core:Enum'
  ]
})(
  withLocale(({ remoteModules, baseUrl, getManualTaskAction, pageProps = {} }) => {
    const [TablePage, Table, usePreset, Filter, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const { apis, ajax } = usePreset();
    const { message, modal } = App.useApp();
    const { getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem, TypeDateRangePickerFilterItem } = filterFields;
    const ref = useRef(null);
    const dataRef = useRef([]);
    const [filter, setFilter] = useState([]);
    const [sort, setSortChange] = useState([]);
    const { selectedRowKeys, selectedRows, setSelectedRowKeys, clearSelectedRows } = Table.useSelectedRow({
      rowKey: 'id'
    });

    const mapFilterValue = useMemo(() => createTaskMapFilterValue({ sort }), [sort]);
    const listParams = useMemo(() => mapFilterValue(filter, getFilterValue), [mapFilterValue, filter, getFilterValue]);

    const rowSelection = useMemo(
      () => ({
        type: 'checkbox',
        selectedRowKeys,
        allowSelectedAll: false,
        onChange: keys => {
          setSelectedRowKeys(keys, dataRef.current || []);
        }
      }),
      [selectedRowKeys, setSelectedRowKeys]
    );

    const handleBatchRetry = useCallback(
      ({ selectedRowKeys: taskIds, reload }) => {
        if (!taskIds?.length) {
          return;
        }
        modal.confirm({
          title: formatMessage({ id: 'ConfirmRetryTask' }),
          onOk: async () => {
            const { data: resData } = await ajax(
              Object.assign({}, apis.task.retry, {
                data: { taskIds }
              })
            );
            if (resData.code !== 0) {
              return;
            }
            message.success(formatMessage({ id: 'TaskModifiedToPending' }));
            clearSelectedRows();
            reload?.();
          }
        });
      },
      [ajax, apis.task.retry, clearSelectedRows, formatMessage, message, modal]
    );

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
          mapFilterValue: (value, getFv) => mapFilterValue(value, getFv || getFilterValue),
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
              type: SuperSelectFilterItem,
              props: {
                label: formatMessage({ id: 'ExecutionMode' }),
                name: 'runnerType',
                single: true,
                api: {
                  loader: () => {
                    return {
                      pageData: [
                        { label: formatMessage({ id: 'ManualExecution' }), value: 'manual' },
                        { label: formatMessage({ id: 'AutomaticExecution' }), value: 'system' }
                      ]
                    };
                  }
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
          params: listParams,
          dataFormat: data => {
            const list = (data.pageData || []).map(item =>
              Object.assign({}, item, {
                disabled: item.status !== 'failed'
              })
            );
            dataRef.current = list;
            return {
              list,
              total: data.totalCount
            };
          }
        })}
        ref={ref}
        pagination={{ paramsType: 'params' }}
        name="admin-task-all-list"
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
                      ref.current?.reload?.({}, true);
                    }}
                  />
                )
              };
            }
          }
        ]}
        rowSelection={rowSelection}
        selectedRows={selectedRows}
        batchActions={[
          {
            key: 'batch-retry',
            label: formatMessage({ id: 'BatchRetry' }),
            onClick: handleBatchRetry
          }
        ]}
        page={{
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
      />
    );
  })
);

export default AllTask;
