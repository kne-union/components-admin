import { createWithRemoteLoader } from '@kne/remote-loader';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import getColumns from './getColumns';
import { useRef } from 'react';
import Create from '../Actions/Create';
import buildActionList from '../Actions/buildActionList';
import TenantCardList from './TenantCardList';

const ListInner = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Filter', 'components-core:Global@usePreset']
})(({ remoteModules, baseUrl, showLength, optionsColumn }) => {
  const [TablePage, Filter, usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis } = usePreset();
  const { getFilterValue } = Filter;
  const ref = useRef(null);
  const navigate = useNavigate();
  const renderCards =
    layout =>
    ({ dataSource } = {}) => (
      <TenantCardList
        layout={layout}
        dataSource={dataSource}
        showLength={showLength}
        onDetail={item => navigate(`detail?id=${encodeURIComponent(item.id)}`)}
        onSuccess={() => ref.current?.reload()}
      />
    );

  return (
    <TablePage
      isNext
      search={{
        name: 'keyword',
        label: formatMessage({ id: 'Keyword' })
      }}
      tab={{
        name: 'status',
        label: formatMessage({ id: 'Status' }),
        list: [
          { label: formatMessage({ id: 'Open' }), value: 'open' },
          { label: formatMessage({ id: 'Close' }), value: 'closed' }
        ]
      }}
      filter={{
        mapFilterValue: value => ({
          filter: getFilterValue(value)
        })
      }}
      {...apis.tenantAdmin.list}
      ref={ref}
      name="tenant-list"
      pagination={{ paramsType: 'params' }}
      renderMobile={renderCards('mobile')}
      renderCard={renderCards('card')}
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
        Object.assign(
          {
            name: 'options',
            title: formatMessage({ id: 'Action' }),
            renderType: 'options',
            fixed: 'right',
            // options 渲染器只认动作数组（或 { list }）：返回 { children: <Actions/> } 会被整列丢弃
            getValueOf: item => ({
              list: buildActionList({ formatMessage, data: item, onSuccess: () => ref.current?.reload() }),
              ...(Number.isInteger(showLength) ? { showLength } : {})
            })
          },
          optionsColumn
        )
      ]}
    />
  );
});

export default withLocale(ListInner);
