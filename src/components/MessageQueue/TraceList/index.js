import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

import getTraceColumns from '../getTraceColumns';
import MessageDetail from '../Actions/MessageDetail';
import Menu from '../Menu';
import { buildListParams } from '../utils';
import { getTraceCardItem } from '../cardItems';
import { createCardRenders } from '../../MailGateway/CardList';

const TraceList = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter', 'components-core:Enum']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, usePreset, Filter, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const { apis } = usePreset();
    const { getFilterValue, fields: filterFields } = Filter;
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
        isNext
        search={{
          name: 'messageId',
          label: formatMessage({ id: 'MessageId' })
        }}
        filter={{
          value: filter,
          onChange: setFilter,
          list: [
            {
              type: InputFilterItem,
              props: { label: formatMessage({ id: 'MessageId' }), name: 'messageId' }
            },
            {
              type: InputFilterItem,
              props: { label: formatMessage({ id: 'Topic' }), name: 'topic' }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                label: formatMessage({ id: 'Event' }),
                name: 'event',
                single: true,
                render: ({ children }) => {
                  return (
                    <Enum moduleName="traceEvent" format="option">
                      {options => children({ options })}
                    </Enum>
                  );
                }
              }
            }
          ]
        }}
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
            title: formatMessage({ id: 'Action' }),
            renderType: 'options',
            fixed: 'right',
            // options 渲染器只认动作数组（或 { list }）：返回 { children: <组件/> } 会被整列丢弃
            getValueOf: item => [
              {
                buttonComponent: MessageDetail,
                data: item,
                type: 'link',
                title: formatMessage({ id: 'Detail' }),
                children: formatMessage({ id: 'ViewDetail' })
              }
            ]
          }
        ]}
        {...createCardRenders(getTraceCardItem({ formatMessage }))}
        page={{
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
      />
    );
  })
);

export default TraceList;
