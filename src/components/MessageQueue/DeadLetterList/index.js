import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { App } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

import getDeadLetterColumns from '../getDeadLetterColumns';
import buildDeadLetterActionList from '../Actions/buildDeadLetterActionList';
import Menu from '../Menu';
import { buildListParams } from '../utils';
import { getDeadLetterCardItem } from '../cardItems';
import { createCardRenders } from '../../MailGateway/CardList';

const DeadLetterList = createWithRemoteLoader({
  modules: [
    'components-core:Layout@TablePage',
    'components-core:TablePage@useSelectedRow',
    'components-core:Global@usePreset',
    'components-core:Filter',
    'components-core:Modal@useConfirmModal'
  ]
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, useSelectedRow, usePreset, Filter, useConfirmModal] = remoteModules;
    const { formatMessage } = useIntl();
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const confirmModal = useConfirmModal();
    const { getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem } = filterFields;
    const ref = useRef(null);
    const dataRef = useRef([]);
    const [filter, setFilter] = useState([]);
    const { selectedRowKeys, selectedRows, setSelectedRowKeys, clearSelectedRows } = useSelectedRow({ rowKey: 'id' });
    const filterValue = getFilterValue(filter);

    const handleBatchReplay = ({ selectedRowKeys: keys, reload }) => {
      const replayedIds = new Set(dataRef.current.concat(selectedRows || []).filter(item => item.replayed).map(item => String(item.id)));
      const ids = (keys || []).filter(id => !replayedIds.has(String(id)));
      if (ids.length === 0) {
        return;
      }
      confirmModal({
        title: formatMessage({ id: 'BatchReplayConfirm' }),
        onConfirm: async () => {
          const { data: resData } = await ajax(
            Object.assign({}, apis.mq.deadLetter.replay, {
              data: ids.length > 1 ? { ids } : { id: ids[0] }
            })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'ReplaySuccess' }));
          clearSelectedRows();
          reload ? reload() : ref.current?.reload?.();
        }
      });
    };

    return (
      <TablePage
        isNext
        search={{
          name: 'topic',
          label: formatMessage({ id: 'Topic' })
        }}
        filter={{
          value: filter,
          onChange: setFilter,
          list: [
            {
              type: InputFilterItem,
              props: { label: formatMessage({ id: 'Topic' }), name: 'topic' }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                label: formatMessage({ id: 'Replayed' }),
                name: 'replayed',
                single: true,
                api: {
                  loader: () => ({
                    pageData: [
                      { label: formatMessage({ id: 'Yes' }), value: true },
                      { label: formatMessage({ id: 'No' }), value: false }
                    ]
                  })
                }
              }
            }
          ]
        }}
        {...Object.assign({}, apis.mq.deadLetter.list, {
          params: buildListParams(filterValue, ['topic', 'replayed'])
        })}
        ref={ref}
        pagination={{ paramsType: 'params' }}
        name="mq-dead-letter-list"
        dataFormat={data => {
          dataRef.current = data.pageData || [];
          return { list: dataRef.current, total: data.totalCount, data };
        }}
        columns={[
          ...getDeadLetterColumns({ formatMessage }),
          {
            name: 'options',
            title: formatMessage({ id: 'Action' }),
            renderType: 'options',
            fixed: 'right',
            // options 渲染器只认动作数组（或 { list }）：返回 { children: <组件/> } 会被整列丢弃
            getValueOf: item =>
              buildDeadLetterActionList({
                formatMessage,
                data: item,
                type: 'link',
                onSuccess: () => {
                  ref.current?.reload?.();
                }
              })
          }
        ]}
        {...createCardRenders(getDeadLetterCardItem({ formatMessage }))}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          allowSelectedAll: false,
          onChange: keys => setSelectedRowKeys(keys, dataRef.current || []),
          getCheckboxProps: record => ({ disabled: record.replayed })
        }}
        selectedRows={selectedRows}
        batchActions={[
          {
            key: 'batch-replay',
            label: formatMessage({ id: 'BatchReplay' }),
            onClick: handleBatchReplay
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

export default DeadLetterList;
