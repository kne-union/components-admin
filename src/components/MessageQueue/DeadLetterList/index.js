import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { Space } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

import getDeadLetterColumns from '../getDeadLetterColumns';
import DeadLetterActions from '../Actions/DeadLetterActions';
import DeadLetterReplay from '../Actions/DeadLetterReplay';
import Menu from '../Menu';
import { buildListParams } from '../utils';

const DeadLetterList = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, usePreset, Filter] = remoteModules;
    const { formatMessage } = useIntl();
    const { apis } = usePreset();
    const { SearchInput, getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, AdvancedSelectFilterItem } = filterFields;
    const ref = useRef(null);
    const [filter, setFilter] = useState([]);
    const [selected, setSelected] = useState({
      selectedRowKeys: [],
      selectedRows: []
    });
    const filterValue = getFilterValue(filter);

    return (
      <TablePage
        {...Object.assign({}, apis.mq.deadLetter.list, {
          params: buildListParams(filterValue, ['topic', 'replayed'])
        })}
        ref={ref}
        pagination={{ paramsType: 'params' }}
        name="mq-dead-letter-list"
        columns={[
          ...getDeadLetterColumns({ formatMessage }),
          {
            name: 'options',
            title: formatMessage({ id: 'Operation' }),
            type: 'options',
            fixed: 'right',
            valueOf: item => {
              return {
                children: (
                  <DeadLetterActions
                    data={item}
                    type="link"
                    onSuccess={() => {
                      ref.current?.reload?.();
                    }}
                  />
                )
              };
            }
          }
        ]}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selected.selectedRowKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            setSelected({ selectedRowKeys, selectedRows });
          },
          getCheckboxProps: record => {
            return {
              disabled: record.replayed
            };
          }
        }}
        topArea={
          <Space>
            <span>{formatMessage({ id: 'SelectedCount' }, { count: selected.selectedRowKeys.length })}</span>
            <DeadLetterReplay
              ids={selected.selectedRowKeys}
              type="link"
              size="small"
              disabled={selected.selectedRowKeys.length === 0}
              onSuccess={() => {
                setSelected({ selectedRowKeys: [], selectedRows: [] });
                ref.current?.reload?.();
              }}>
              {formatMessage({ id: 'BatchReplay' })}
            </DeadLetterReplay>
          </Space>
        }
        page={{
          filter: {
            value: filter,
            onChange: setFilter,
            list: [
              [
                <InputFilterItem label={formatMessage({ id: 'Topic' })} name="topic" />,
                <AdvancedSelectFilterItem
                  label={formatMessage({ id: 'Replayed' })}
                  name="replayed"
                  single
                  api={{
                    loader: () => ({
                      pageData: [
                        { label: formatMessage({ id: 'Yes' }), value: true },
                        { label: formatMessage({ id: 'No' }), value: false }
                      ]
                    })
                  }}
                />
              ]
            ]
          },
          titleExtra: <SearchInput name="topic" label={formatMessage({ id: 'Topic' })} />,
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
      />
    );
  })
);

export default DeadLetterList;
