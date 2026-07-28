import { createWithRemoteLoader } from '@kne/remote-loader';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import getColumns from './getColumns';
import { useRef } from 'react';
import Create from '../Actions/Create';
import Actions from '../Actions';

const ListInner = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Filter', 'components-core:Global@usePreset']
})(({ remoteModules, baseUrl }) => {
  const [TablePage, Filter, usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis } = usePreset();
  const { getFilterValue } = Filter;
  const ref = useRef(null);
  const navigate = useNavigate();

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
