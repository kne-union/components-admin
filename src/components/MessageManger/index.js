import { createWithRemoteLoader } from '@kne/remote-loader';
import AppChildrenRouter from '@kne/app-children-router';
import { Button, Descriptions, Space, Tag } from 'antd';
import JsonView from '@kne/json-view';
import '@kne/json-view/dist/index.css';
import { useIntl } from '@kne/react-intl';
import { useRef, useState } from 'react';
import withLocale from './withLocale';
import { buildMessageParams } from './utils';

const MESSAGE_TYPE_COLORS = {
  0: 'blue',
  1: 'green'
};

const DetailContent = withLocale(({ data, type }) => {
  const { formatMessage } = useIntl();
  const isRecord = type === 'record';

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label={formatMessage({ id: 'ID' })}>{data?.id}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'Code' })}>{data?.code || '-'}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: isRecord ? 'Target' : 'Name' })}>{isRecord ? data?.name : data?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({ id: 'Type' })}>{formatMessage({ id: Number(data?.type) === 1 ? 'SMS' : 'Email' })}</Descriptions.Item>
        {isRecord ? <Descriptions.Item label={formatMessage({ id: 'TemplateId' })}>{data?.templateId || '-'}</Descriptions.Item> : null}
        {!isRecord ? <Descriptions.Item label={formatMessage({ id: 'Level' })}>{formatMessage({ id: Number(data?.level) === 1 ? 'Business' : 'System' })}</Descriptions.Item> : null}
        {!isRecord ? <Descriptions.Item label={formatMessage({ id: 'Status' })}>{formatMessage({ id: Number(data?.status) === 1 ? 'Disabled' : 'Enabled' })}</Descriptions.Item> : null}
        <Descriptions.Item label={formatMessage({ id: 'CreatedAt' })}>{data?.createdAt || '-'}</Descriptions.Item>
      </Descriptions>
      {isRecord ? (
        <>
          <div>
            <strong>{formatMessage({ id: 'Props' })}</strong>
            <JsonView data={data?.props || {}} collapsedFrom={1} />
          </div>
          <div>
            <strong>{formatMessage({ id: 'Content' })}</strong>
            <JsonView data={data?.content || {}} collapsedFrom={1} />
          </div>
        </>
      ) : (
        <div>
          <strong>{formatMessage({ id: 'Content' })}</strong>
          <pre style={{ marginTop: 8, padding: 12, background: '#f5f5f5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{data?.content || '-'}</pre>
        </div>
      )}
    </Space>
  );
});

const MessageMenu = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(
  withLocale(({ remoteModules, baseUrl }) => {
    const [Menu] = remoteModules;
    const { formatMessage } = useIntl();
    const rootPath = baseUrl || '';

    return (
      <Menu
        items={[
          { label: formatMessage({ id: 'TemplateList' }), key: 'templates', path: rootPath },
          { label: formatMessage({ id: 'RecordList' }), key: 'records', path: `${rootPath}/records` }
        ]}
      />
    );
  })
);

const renderEnumTag = ({ formatMessage, value, moduleName }) => {
  if (moduleName === 'messageManagerType') {
    return <Tag color={MESSAGE_TYPE_COLORS[value] || 'default'}>{formatMessage({ id: Number(value) === 1 ? 'SMS' : 'Email' })}</Tag>;
  }
  if (moduleName === 'messageTemplateLevel') {
    return <Tag color={Number(value) === 1 ? 'purple' : 'blue'}>{formatMessage({ id: Number(value) === 1 ? 'Business' : 'System' })}</Tag>;
  }
  return <Tag color={Number(value) === 1 ? 'default' : 'green'}>{formatMessage({ id: Number(value) === 1 ? 'Disabled' : 'Enabled' })}</Tag>;
};

const getTemplateColumns = ({ formatMessage, openDetail }) => [
  { name: 'name', title: formatMessage({ id: 'Name' }), type: 'mainInfo' },
  { name: 'code', title: formatMessage({ id: 'Code' }) },
  {
    name: 'type',
    title: formatMessage({ id: 'Type' }),
    valueOf: item => renderEnumTag({ formatMessage, value: item.type, moduleName: 'messageManagerType' })
  },
  {
    name: 'level',
    title: formatMessage({ id: 'Level' }),
    valueOf: item => renderEnumTag({ formatMessage, value: item.level, moduleName: 'messageTemplateLevel' })
  },
  {
    name: 'status',
    title: formatMessage({ id: 'Status' }),
    valueOf: item => renderEnumTag({ formatMessage, value: item.status, moduleName: 'messageTemplateStatus' })
  },
  { name: 'createdAt', title: formatMessage({ id: 'CreatedAt' }), type: 'datetime' },
  {
    name: 'options',
    title: formatMessage({ id: 'Operation' }),
    type: 'options',
    fixed: 'right',
    valueOf: item => ({
      children: (
        <Button type="link" onClick={() => openDetail(item, 'template')}>
          {formatMessage({ id: 'Detail' })}
        </Button>
      )
    })
  }
];

const getRecordColumns = ({ formatMessage, openDetail }) => [
  { name: 'name', title: formatMessage({ id: 'Target' }), type: 'mainInfo' },
  { name: 'code', title: formatMessage({ id: 'Code' }) },
  {
    name: 'type',
    title: formatMessage({ id: 'Type' }),
    valueOf: item => renderEnumTag({ formatMessage, value: item.type, moduleName: 'messageManagerType' })
  },
  { name: 'templateId', title: formatMessage({ id: 'TemplateId' }) },
  { name: 'createdAt', title: formatMessage({ id: 'CreatedAt' }), type: 'datetime' },
  {
    name: 'options',
    title: formatMessage({ id: 'Operation' }),
    type: 'options',
    fixed: 'right',
    valueOf: item => ({
      children: (
        <Button type="link" onClick={() => openDetail(item, 'record')}>
          {formatMessage({ id: 'Detail' })}
        </Button>
      )
    })
  }
];

const TemplateList = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter', 'components-core:Enum', 'components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, usePreset, Filter, Enum, useModal] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const { SearchInput, getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem } = filterFields;
    const modal = useModal();
    const ref = useRef(null);
    const [filter, setFilter] = useState([]);
    const filterValue = getFilterValue(filter);
    const openDetail = data => {
      modal({
        title: formatMessage({ id: 'TemplateDetail' }),
        width: 760,
        footer: null,
        children: <DetailContent data={data} type="template" />
      });
    };

    return (
      <TablePage
        {...Object.assign({}, apis.messageManger.templates.list, {
          params: buildMessageParams(filterValue, ['type', 'code', 'level', 'status'])
        })}
        ref={ref}
        pagination={{ paramsType: 'params' }}
        name="message-manger-template-list"
        columns={getTemplateColumns({ formatMessage, openDetail })}
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
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Filter', 'components-core:Enum', 'components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, usePreset, Filter, Enum, useModal] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const { SearchInput, getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem } = filterFields;
    const modal = useModal();
    const ref = useRef(null);
    const [filter, setFilter] = useState([]);
    const filterValue = getFilterValue(filter);
    const openDetail = data => {
      modal({
        title: formatMessage({ id: 'RecordDetail' }),
        width: 760,
        footer: null,
        children: <DetailContent data={data} type="record" />
      });
    };

    return (
      <TablePage
        {...Object.assign({}, apis.messageManger.records.list, {
          params: buildMessageParams(filterValue, ['type', 'code', 'name'])
        })}
        ref={ref}
        pagination={{ paramsType: 'params' }}
        name="message-manger-record-list"
        columns={getRecordColumns({ formatMessage, openDetail })}
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
    <AppChildrenRouter
      list={[
        { index: true, element: <TemplateList {...props} baseUrl={baseUrl} /> },
        { path: 'records', element: <RecordList {...props} baseUrl={baseUrl} /> }
      ]}
    >
      {children}
    </AppChildrenRouter>
  );
};

export default MessageManger;
export { TemplateList, RecordList, MessageMenu };
