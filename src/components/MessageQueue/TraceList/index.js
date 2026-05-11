import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

import getTraceColumns from '../getTraceColumns';
import MessageDetail from '../Actions/MessageDetail';
import Menu from '../Menu';
import { buildListParams } from '../utils';

const TraceList = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter', 'components-core:Enum']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, usePreset, Filter, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const { apis } = usePreset();
    const { SearchInput, getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem } = filterFields;
    const [searchParams] = useSearchParams();
    const initialMessageId = searchParams.get('messageId');
    const ref = useRef(null);
    const [filter, setFilter] = useState(
      initialMessageId
        ? [
            {
              name: 'messageId',
              label: formatMessage({ id: 'MessageId' }),
              value: initialMessageId
            }
          ]
        : []
    );
    const filterValue = getFilterValue(filter);

    return (
      <TablePage
        {...Object.assign({}, apis.mq.trace.list, {
          params: buildListParams(filterValue, ['topic', 'messageId', 'event'])
        })}
        ref={ref}
        pagination={{ paramsType: 'params' }}
        name="mq-trace-list"
        columns={[
          ...getTraceColumns({ formatMessage }),
          {
            name: 'options',
            title: formatMessage({ id: 'Operation' }),
            type: 'options',
            fixed: 'right',
            valueOf: item => {
              return {
                children: <MessageDetail data={item} type="link" title={formatMessage({ id: 'Detail' })}>{formatMessage({ id: 'ViewDetail' })}</MessageDetail>
              };
            }
          }
        ]}
        page={{
          filter: {
            value: filter,
            onChange: setFilter,
            list: [
              [
                <InputFilterItem label={formatMessage({ id: 'MessageId' })} name="messageId" />,
                <InputFilterItem label={formatMessage({ id: 'Topic' })} name="topic" />,
                <SuperSelectFilterItem
                  label={formatMessage({ id: 'Event' })}
                  name="event"
                  single
                  render={({ children }) => {
                    return (
                      <Enum moduleName="traceEvent" format="option">
                        {options => children({ options })}
                      </Enum>
                    );
                  }}
                />
              ]
            ]
          },
          titleExtra: <SearchInput name="messageId" label={formatMessage({ id: 'MessageId' })} />,
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
      />
    );
  })
);

export default TraceList;
