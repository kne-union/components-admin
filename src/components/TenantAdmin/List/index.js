import { createWithRemoteLoader } from '@kne/remote-loader';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import getColumns from './getColumns';
import { useRef, useState } from 'react';
import Create from '../Actions/Create';
import Actions from '../Actions';

const ListInner = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Filter', 'components-core:Global@usePreset', 'components-core:StateBar']
})(({ remoteModules, baseUrl }) => {
  const [TablePage, Filter, usePreset, StateBar] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis } = usePreset();
  const { getFilterValue } = Filter;
  const ref = useRef(null);
  const [filter, setFilter] = useState([]);
  const filterValue = getFilterValue(filter);
  const navigate = useNavigate();

  const stateType = [
    { tab: formatMessage({ id: 'All' }), key: 'all' },
    {
      tab: formatMessage({ id: 'Open' }),
      key: 'open'
    },
    {
      tab: formatMessage({ id: 'Close' }),
      key: 'closed'
    }
  ];

  const stateTypeMap = new Map(stateType.map(item => [item.key, item]));

  return (
    <TablePage
      isNext
      search={{
        name: 'keyword',
        label: formatMessage({ id: 'Keyword' })
      }}
      filter={{
        value: filter,
        onChange: setFilter
      }}
      {...Object.assign({}, apis.tenantAdmin.list, {
        params: Object.assign({}, { filter: filterValue })
      })}
      ref={ref}
      name="tenant-list"
      pagination={{ paramsType: 'params' }}
      topArea={
        <StateBar
          type="radio"
          size="small"
          activeKey={filterValue.status || 'all'}
          onChange={value => {
            const currentState = stateTypeMap.get(value);
            setFilter(filter => {
              const newFilter = filter.slice(0);
              const currentIndex = filter.findIndex(item => item.name === 'status');

              if (currentState.key === 'all') {
                newFilter.splice(currentIndex, 1);
              } else if (currentIndex === -1) {
                newFilter.push({
                  name: 'status',
                  label: formatMessage({ id: 'Status' }),
                  value: { label: currentState.tab, value: currentState.key }
                });
              } else {
                newFilter.splice(currentIndex, 1, {
                  name: 'status',
                  label: formatMessage({ id: 'Status' }),
                  value: { label: currentState.tab, value: currentState.key }
                });
              }
              return newFilter;
            });
          }}
          stateOption={stateType}
        />
      }
      buttonGroup={{
        list: [
          {
            buttonComponent: Create,
            type: 'primary',
            children: formatMessage({ id: 'AddTenant' }),
            onSuccess: () => ref.current?.reload()
          }
        ]
      }}
      columns={[
        ...getColumns({ navigate, formatMessage }),
        {
          name: 'options',
          title: formatMessage({ id: 'Operation' }),
          renderType: 'options',
          fixed: 'right',
          getValueOf: item => {
            return {
              children: <Actions data={item} onSuccess={() => ref.current?.reload()} />
            };
          }
        }
      ]}
    />
  );
});

export default withLocale(ListInner);
