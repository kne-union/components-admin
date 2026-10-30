import { createWithRemoteLoader } from '@kne/remote-loader';
import AppChildrenRouter from '@kne/app-children-router';
import { useIntl } from '@kne/react-intl';
import { useRef, useState } from 'react';
import withLocale from './withLocale';
import BizUnit from '@components/BizUnit';
import { buildMessageParams } from './utils';
import MessageMenu from './Menu';
import Dashboard from './Dashboard';
import { getTemplateBaseColumns, getRecordColumns, getTemplateCardItem, getRecordCardItem } from './getColumns';
import { createCardRenders } from '@components/MailGateway/CardList';
import TemplateFormInner, { toTemplateFormData, toTemplatePayload } from './TemplateFormInner';
import { Copy, Detail, Preview, SendMessage, openDetail, openTemplatePreview } from './Actions';

// 系统模板由服务端模板文件导入并在启动时覆盖，界面上不提供编辑和删除
const getSystemLockedActions = data =>
  ['save', 'remove'].map(name => ({ name, reset: ({ hidden }) => ({ name, hidden: hidden || Number(data?.level) === 0 }) }));

const TemplateList = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Filter', 'components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Filter, useModal] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields;
    const { apis } = usePreset();
    const modal = useModal();
    const { formatMessage } = useIntl();
    const templateApis = apis.messageManger.templates;
    const onPreview = template => openTemplatePreview({ modal, formatMessage, template });
    const toOptions = ids => ids.map((id, value) => ({ label: formatMessage({ id }), value: String(value) }));

    return (
      <BizUnit
        isNext
        name="message-manger-template-list"
        page={Object.assign({ title: formatMessage({ id: 'TemplateList' }), menu: <MessageMenu baseUrl={baseUrl} /> }, pageProps)}
        apis={{
          list: Object.assign({}, templateApis.list, { params: { filter: {} } }),
          create: ({ formData }) => Object.assign({}, templateApis.create, { data: toTemplatePayload(formData) }),
          save: ({ formData, data }) =>
            Object.assign({}, templateApis.save, { urlParams: { id: data.id }, data: toTemplatePayload(formData, { isEdit: true }) }),
          remove: ({ data }) => Object.assign({}, templateApis.remove, { urlParams: { id: data.id } }),
          setStatus: ({ data }) =>
            Object.assign({}, templateApis.setStatus, {
              urlParams: { id: data.id },
              data: { status: Number(data.status) === 0 ? 1 : 0 }
            })
        }}
        getColumns={() => getTemplateBaseColumns({ formatMessage, onPreview })}
        getFormInner={({ action }) => <TemplateFormInner action={action} />}
        getActionList={props => [
          ...getSystemLockedActions(props.data),
          { ...props, buttonComponent: Preview, children: formatMessage({ id: 'Preview' }) },
          { ...props, buttonComponent: Copy, children: formatMessage({ id: 'Copy' }) },
          {
            buttonComponent: SendMessage,
            data: props.data,
            detailType: 'template',
            onSuccess: props.onSuccess,
            hidden: Number(props.data?.status) !== 0,
            children: formatMessage({ id: 'SendMessage' })
          },
          { buttonComponent: Detail, data: props.data, detailType: 'template', children: formatMessage({ id: 'Detail' }) }
        ]}
        filter={{
          list: [
            {
              type: SuperSelectFilterItem,
              props: { name: 'type', label: formatMessage({ id: 'Type' }), single: true, options: toOptions(['EmailChannel', 'SMS']) }
            },
            {
              type: SuperSelectFilterItem,
              props: { name: 'level', label: formatMessage({ id: 'Level' }), single: true, options: toOptions(['System', 'Business']) }
            },
            {
              type: SuperSelectFilterItem,
              props: { name: 'status', label: formatMessage({ id: 'Status' }), single: true, options: toOptions(['Enabled', 'Disabled']) }
            }
          ]
        }}
        options={{
          bizName: formatMessage({ id: 'Template' }),
          keywordFilterLabel: formatMessage({ id: 'TemplateKeyword' }),
          openStatus: 0,
          closedStatus: 1,
          formSize: 'large',
          saveData: toTemplateFormData,
          removeMessage: formatMessage({ id: 'ConfirmRemoveTemplate' }),
          openButtonProps: { children: formatMessage({ id: 'Enable' }) },
          closeButtonProps: { children: formatMessage({ id: 'Disable' }) },
          tableProps: createCardRenders(getTemplateCardItem({ formatMessage, onPreview }))
        }}
      />
    );
  })
);

const RecordList = createWithRemoteLoader({
  modules: [
    'components-core:Layout@TablePage',
    'components-core:Global@usePreset',
    'components-core:Filter',
    'components-core:Enum',
    'components-core:Modal@useModal'
  ]
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, usePreset, Filter, Enum, useModal] = remoteModules;
    const { apis } = usePreset();
    const modal = useModal();
    const { formatMessage } = useIntl();
    const onDetail = data => openDetail({ modal, formatMessage, data, detailType: 'record', onSuccess: () => ref.current?.refresh() });
    const { getFilterValue, fields: filterFields } = Filter;
    const { InputFilterItem, SuperSelectFilterItem } = filterFields;
    const ref = useRef(null);
    const [filter, setFilter] = useState([]);
    const filterValue = getFilterValue(filter);

    return (
      <TablePage
        isNext
        search={{
          name: 'name',
          label: formatMessage({ id: 'Recipient' })
        }}
        filter={{
          value: filter,
          onChange: setFilter,
          list: [
            {
              type: InputFilterItem,
              props: { label: formatMessage({ id: 'TemplateCode' }), name: 'code' }
            },
            {
              type: InputFilterItem,
              props: { label: formatMessage({ id: 'Recipient' }), name: 'name' }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                label: formatMessage({ id: 'Type' }),
                name: 'type',
                single: true,
                render: ({ children }) => (
                  <Enum moduleName="messageManagerType" format="option">
                    {options => children({ options })}
                  </Enum>
                )
              }
            }
          ]
        }}
        {...Object.assign({}, apis.messageManger.records.list, {
          params: buildMessageParams(filterValue, ['type', 'code', 'name'])
        })}
        ref={ref}
        pagination={{ paramsType: 'params' }}
        name="message-manger-record-list"
        columns={getRecordColumns({ formatMessage, onSuccess: () => ref.current?.refresh(), onDetail })}
        {...createCardRenders(getRecordCardItem({ formatMessage, onDetail }))}
        page={{
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
      baseUrl={baseUrl}
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
export { getTemplateBaseColumns, getTemplateColumns, getRecordColumns, TemplateColumnsLoader, RecordColumnsLoader } from './getColumns';
export { default as TemplateFormInner, toTemplatePayload, toTemplateFormData } from './TemplateFormInner';
export { default as TemplatePreview } from './TemplatePreview';
export { default as DetailContent } from './DetailContent';
export { default as Actions, Detail, SendMessage, Resend, Preview, Copy } from './Actions';
