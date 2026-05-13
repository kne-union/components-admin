import { createWithRemoteLoader } from '@kne/remote-loader';
import AppChildrenRouter from '@kne/app-children-router';
import { useIntl } from '@kne/react-intl';
import { useRef, useState } from 'react';
import withLocale from './withLocale';
import { buildMessageParams } from './utils';
import MessageMenu from './Menu';
import Dashboard from './Dashboard';
import { getTemplateColumns, getRecordColumns } from './getColumns';

const TemplateList = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter', 'components-core:Enum']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, usePreset, Filter, Enum] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const { SearchInput, getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem } = filterFields;
    const ref = useRef(null);
    const [filter, setFilter] = useState([]);
    const filterValue = getFilterValue(filter);

    return (
      <TablePage
        {...Object.assign({}, apis.messageManger.templates.list, {
          params: buildMessageParams(filterValue, ['type', 'code', 'level', 'status'])
        })}
        ref={ref}
        pagination={{ paramsType: 'params' }}
        name="message-manger-template-list"
        columns={getTemplateColumns({ formatMessage, onSuccess: () => ref.current?.refresh() })}
        page={{
          filter: {
            value: filter,
            onChange: setFilter,
            list: [
              [
                <InputFilterItem label={formatMessage({ id: 'Code' })} name="code" />,
                <SuperSelectFilterItem
                  label={formatMessage({ id: 'Type' })}
                  name="type"
                  single
                  render={({ children }) => (
                    <Enum moduleName="messageManagerType" format="option">
                      {options => children({ options })}
                    </Enum>
                  )}
                />,
                <SuperSelectFilterItem
                  label={formatMessage({ id: 'Level' })}
                  name="level"
                  single
                  render={({ children }) => (
                    <Enum moduleName="messageTemplateLevel" format="option">
                      {options => children({ options })}
                    </Enum>
                  )}
                />,
                <SuperSelectFilterItem
                  label={formatMessage({ id: 'Status' })}
                  name="status"
                  single
                  render={({ children }) => (
                    <Enum moduleName="messageTemplateStatus" format="option">
                      {options => children({ options })}
                    </Enum>
                  )}
                />
              ]
            ]
          },
          titleExtra: <SearchInput name="code" label={formatMessage({ id: 'Code' })} />,
          menu: <MessageMenu baseUrl={baseUrl} />,
          ...pageProps
        }}
      />
    );
  })
);

const RecordList = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter', 'components-core:Enum']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, usePreset, Filter, Enum] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const { SearchInput, getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem } = filterFields;
    const ref = useRef(null);
    const [filter, setFilter] = useState([]);
    const filterValue = getFilterValue(filter);

    return (
      <TablePage
        {...Object.assign({}, apis.messageManger.records.list, {
          params: buildMessageParams(filterValue, ['type', 'code', 'name'])
        })}
        ref={ref}
        pagination={{ paramsType: 'params' }}
        name="message-manger-record-list"
        columns={getRecordColumns({ formatMessage, onSuccess: () => ref.current?.refresh() })}
        page={{
          filter: {
            value: filter,
            onChange: setFilter,
            list: [
              [
                <InputFilterItem label={formatMessage({ id: 'Code' })} name="code" />,
                <InputFilterItem label={formatMessage({ id: 'Target' })} name="name" />,
                <SuperSelectFilterItem
                  label={formatMessage({ id: 'Type' })}
                  name="type"
                  single
                  render={({ children }) => (
                    <Enum moduleName="messageManagerType" format="option">
                      {options => children({ options })}
                    </Enum>
                  )}
                />
              ]
            ]
          },
          titleExtra: <SearchInput name="name" label={formatMessage({ id: 'Target' })} />,
          menu: <MessageMenu baseUrl={baseUrl} />,
          ...pageProps
        }}
      />
    );
  })
);

const MessageManger = ({ baseUrl, children, ...props }) => {
  return (
    <AppChildrenRouter baseUrl={baseUrl}
      list={[
        { index: true, element: <Dashboard {...props} baseUrl={baseUrl} /> },
        { path: 'templates', element: <TemplateList {...props} baseUrl={baseUrl} /> },
        { path: 'records', element: <RecordList {...props} baseUrl={baseUrl} /> }
      ]}
    >
      {children}
    </AppChildrenRouter>
  );
};

export default MessageManger;
export { TemplateList, RecordList, MessageMenu, Dashboard };
export { default as enums } from './enums';
export { getTemplateColumns, getRecordColumns, TemplateColumnsLoader, RecordColumnsLoader } from './getColumns';
export { default as DetailContent } from './DetailContent';
export { default as Actions, Detail, SendMessage } from './Actions';
