import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

import getColumns from '../getColumns';
import Actions from '../Actions';
import Menu from '../Menu';
import PublishMessage from '../PublishMessage';
import { buildListParams } from '../utils';

const MessageList = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter', 'components-core:Enum']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, usePreset, Filter, Enum] = remoteModules;
    const { formatMessage } = useIntl();
    const { apis } = usePreset();
    const { getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem } = filterFields;
    const navigate = useNavigate();
    const ref = useRef(null);
    const [filter, setFilter] = useState([]);
    const filterValue = getFilterValue(filter);

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
              type: InputFilterItem,
              props: { label: formatMessage({ id: 'TraceId' }), name: 'traceId' }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                label: formatMessage({ id: 'Status' }),
                name: 'status',
                single: true,
                render: ({ children }) => {
                  return (
                    <Enum moduleName="messageStatus" format="option">
                      {options => children({ options })}
                    </Enum>
                  );
                }
              }
            }
          ]
        }}
        {...Object.assign({}, apis.mq.message.list, {
          params: buildListParams(filterValue, ['topic', 'status', 'traceId'])
        })}
        ref={ref}
        pagination={{ paramsType: 'params' }}
        name="mq-message-list"
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
                    data={item}
                    type="link"
                    onTrace={() => {
                      navigate(`${baseUrl}/traces?messageId=${encodeURIComponent(item.messageId || item.id)}`);
                    }}
                    onSuccess={() => {
                      ref.current?.reload?.();
                    }}
                  />
                )
              };
            }
          }
        ]}
        buttonGroup={{
          list: [
            {
              buttonComponent: PublishMessage,
              type: 'primary',
              onSuccess: () => ref.current?.reload?.()
            }
          ]
        }}
        page={{
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
      />
    );
  })
);

export default MessageList;
