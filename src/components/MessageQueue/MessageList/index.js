import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Space } from 'antd';
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
    const { SearchInput, getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem } = filterFields;
    const navigate = useNavigate();
    const ref = useRef(null);
    const [filter, setFilter] = useState([]);
    const filterValue = getFilterValue(filter);

    return (
      <TablePage
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
            type: 'options',
            fixed: 'right',
            valueOf: item => {
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
        page={{
          filter: {
            value: filter,
            onChange: setFilter,
            list: [
              [
                <InputFilterItem label={formatMessage({ id: 'Topic' })} name="topic" />,
                <InputFilterItem label={formatMessage({ id: 'TraceId' })} name="traceId" />,
                <SuperSelectFilterItem
                  label={formatMessage({ id: 'Status' })}
                  name="status"
                  single
                  render={({ children }) => {
                    return (
                      <Enum moduleName="messageStatus" format="option">
                        {options => children({ options })}
                      </Enum>
                    );
                  }}
                />
              ]
            ]
          },
          titleExtra: (
            <Space>
              <SearchInput name="topic" label={formatMessage({ id: 'Topic' })} />
              <PublishMessage onSuccess={() => ref.current?.reload?.()} />
            </Space>
          ),
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
      />
    );
  })
);

export default MessageList;
