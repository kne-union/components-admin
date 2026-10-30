import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { App, Empty, Tag } from 'antd';
import { useIntl } from '@kne/react-intl';
import dayjs from 'dayjs';
import withLocale from './withLocale';
import TemplateForm, { toTemplateFormData } from './TemplateForm';
import TemplatePreview from './TemplatePreview';
import { createRequest } from './utils';

const TemplateTable = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:TablePage@Table',
    'components-core:FormInfo@useFormModal',
    'components-core:Modal@useModal'
  ]
})(({ remoteModules, list, apis, tenantId, hasEdit, reload }) => {
  const [usePreset, Table, useFormModal, useModal] = remoteModules;
  const { ajax } = usePreset();
  const formModal = useFormModal();
  const modal = useModal();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();

  const request = async (api, payload) => {
    const { data: resData } = await ajax(createRequest(api, tenantId, payload));
    return resData.code === 0 ? resData : null;
  };

  const loadTemplate = async code => {
    const resData = await request(apis.templateDetail, { code });
    return resData ? resData.data.template : null;
  };

  const openEdit = async item => {
    const template = await loadTemplate(item.code);
    if (!template) {
      return;
    }
    formModal({
      title: `${formatMessage({ id: 'EditTemplate' })} - ${item.name || item.code}`,
      size: 'large',
      children: <TemplateForm template={template} />,
      formProps: {
        data: toTemplateFormData(template),
        onSubmit: async formData => {
          const resData = await request(apis.templateSave, Object.assign({ code: item.code }, formData));
          if (!resData) {
            return false;
          }
          message.success(formatMessage({ id: 'SaveSuccess' }));
          reload();
        }
      }
    });
  };

  const openPreview = async item => {
    const template = await loadTemplate(item.code);
    if (!template) {
      return;
    }
    modal({
      title: `${formatMessage({ id: 'Preview' })} - ${item.name || item.code}`,
      size: 'large',
      bodyScroll: false,
      footer: null,
      children: <TemplatePreview apis={apis} tenantId={tenantId} code={item.code} template={template} />
    });
  };

  return (
    <Table
      rowKey="code"
      dataSource={list}
      columns={[
        { name: 'name', title: formatMessage({ id: 'TemplateName' }), type: 'mainInfo', primary: false, hover: false },
        { name: 'code', title: formatMessage({ id: 'TemplateCode' }) },
        { name: 'description', title: formatMessage({ id: 'Description' }), renderType: 'description' },
        {
          name: 'customized',
          title: formatMessage({ id: 'Status' }),
          getValueOf: item => {
            if (!item.customized) {
              return <Tag>{formatMessage({ id: 'UseSystemTemplate' })}</Tag>;
            }
            return Number(item.status) === 0 ? (
              <Tag color="green">{formatMessage({ id: 'Customized' })}</Tag>
            ) : (
              <Tag color="orange">{`${formatMessage({ id: 'Customized' })} · ${formatMessage({ id: 'Disabled' })}`}</Tag>
            );
          }
        },
        {
          name: 'updatedAt',
          title: formatMessage({ id: 'UpdatedAt' }),
          getValueOf: item => (item.updatedAt ? dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm') : '-')
        },
        {
          name: 'options',
          renderType: 'options',
          title: formatMessage({ id: 'Action' }),
          fixed: 'right',
          getValueOf: item => {
            const preview = { children: formatMessage({ id: 'Preview' }), onClick: () => openPreview(item) };
            if (!hasEdit) {
              return [preview];
            }
            if (!item.customized) {
              return [
                {
                  children: formatMessage({ id: 'Customize' }),
                  onClick: async () => {
                    if (!(await request(apis.templateCustomize, { code: item.code }))) {
                      return;
                    }
                    message.success(formatMessage({ id: 'CustomizeSuccess' }));
                    reload();
                    openEdit(item);
                  }
                },
                preview
              ];
            }
            const enabled = Number(item.status) === 0;
            return [
              { children: formatMessage({ id: 'Edit' }), onClick: () => openEdit(item) },
              preview,
              {
                children: formatMessage({ id: enabled ? 'Disable' : 'Enable' }),
                onClick: async () => {
                  if (!(await request(apis.templateSetStatus, { code: item.code, status: enabled ? 1 : 0 }))) {
                    return;
                  }
                  message.success(formatMessage({ id: 'SaveSuccess' }));
                  reload();
                }
              },
              {
                children: formatMessage({ id: 'Reset' }),
                confirm: true,
                message: formatMessage({ id: 'ResetConfirm' }),
                onClick: async () => {
                  if (!(await request(apis.templateReset, { code: item.code }))) {
                    return;
                  }
                  message.success(formatMessage({ id: 'ResetSuccess' }));
                  reload();
                }
              }
            ];
          }
        }
      ]}
    />
  );
});

const TemplateList = withLocale(({ apis, tenantId, hasEdit = true }) => {
  const { formatMessage } = useIntl();
  return (
    <Fetch
      {...createRequest(apis.templateList, tenantId)}
      render={({ data, reload }) => {
        const list = data?.list || [];
        if (!list.length) {
          return <Empty description={formatMessage({ id: 'NoTemplate' })} />;
        }
        return <TemplateTable list={list} apis={apis} tenantId={tenantId} hasEdit={hasEdit} reload={reload} />;
      }}
    />
  );
});

export default TemplateList;
