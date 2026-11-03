import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef } from 'react';
import { App, Empty } from 'antd';
import { useIntl } from '@kne/react-intl';
import dayjs from 'dayjs';
import withLocale from './withLocale';
import TemplateForm, { toTemplateFormData } from './TemplateForm';
import TemplatePreview from './TemplatePreview';
import { createRequest, filterTemplates, filterTemplatesByType, getTenantOpenState } from './utils';

// 模版类型：0 邮件，1 短信
const TEMPLATE_TYPES = [0, 1];
const isSms = item => Number(item?.type) === 1;

const TENANT_OPEN_TAGS = {
  open: { type: 'success', id: 'TenantOpen' },
  closed: { type: 'default', id: 'TenantClosed' },
  platformClosed: { type: 'default', id: 'PlatformClosed' }
};

// 用带搜索工具栏的 TablePage，与 system-layout 列表页的表格样式保持一致；模版数量少，不分页，前端按关键词过滤
const TemplateList = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:TablePage',
    'components-core:Filter',
    'components-core:FormInfo@useFormModal',
    'components-core:Modal@useModal'
  ]
})(({ remoteModules, apis, tenantId, hasEdit, editableTypes }) => {
  const [usePreset, TablePage, Filter, useFormModal, useModal] = remoteModules;
  const { SuperSelectFilterItem } = Filter.fields;
  const ref = useRef(null);
  const reload = () => ref.current?.reload();
  const { ajax } = usePreset();
  const formModal = useFormModal();
  const modal = useModal();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  // 只有管理端 apis 提供该接口：平台对单个租户开放 / 关闭模版管理
  const canSetTenantOpen = !!apis.templateSetTenantOpen;

  const request = async (api, payload) => {
    const { data: resData } = await ajax(createRequest(api, tenantId, payload));
    return resData.code === 0 ? resData : null;
  };

  const loadTemplate = async ({ code, type }) => {
    const resData = await request(apis.templateDetail, { code, type });
    return resData ? resData.data.template : null;
  };

  // 未定制时以系统模版为底稿编辑，保存后才成为租户自定义模版
  const openEdit = async item => {
    const template = await loadTemplate(item);
    if (!template) {
      return;
    }
    formModal({
      title: `${formatMessage({ id: item.customized ? 'EditTemplate' : 'CustomizeTemplate' })} - ${item.name || item.code}`,
      size: 'large',
      children: <TemplateForm template={template} />,
      formProps: {
        data: toTemplateFormData(template),
        onSubmit: async formData => {
          const resData = await request(apis.templateSave, Object.assign({ code: item.code, type: item.type }, formData));
          if (!resData) {
            return false;
          }
          message.success(formatMessage({ id: item.customized ? 'SaveSuccess' : 'CustomizeSuccess' }));
          reload();
        }
      }
    });
  };

  const openPreview = async item => {
    const template = await loadTemplate(item);
    if (!template) {
      return;
    }
    modal({
      title: `${formatMessage({ id: 'Preview' })} - ${item.name || item.code}`,
      size: 'large',
      bodyScroll: false,
      footer: null,
      children: <TemplatePreview apis={apis} tenantId={tenantId} code={item.code} type={item.type} template={template} />
    });
  };

  const getTemplateActions = item => {
    const preview = { children: formatMessage({ id: 'Preview' }), onClick: () => openPreview(item) };
    if (!hasEdit || !editableTypes.includes(Number(item.type || 0))) {
      return [preview];
    }
    if (!item.customized) {
      return [{ children: formatMessage({ id: 'Customize' }), onClick: () => openEdit(item) }, preview];
    }
    const enabled = Number(item.status) === 0;
    return [
      { children: formatMessage({ id: 'Edit' }), onClick: () => openEdit(item) },
      preview,
      {
        children: formatMessage({ id: enabled ? 'Disable' : 'Enable' }),
        onClick: async () => {
          if (!(await request(apis.templateSetStatus, { code: item.code, type: item.type, status: enabled ? 1 : 0 }))) {
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
          if (!(await request(apis.templateReset, { code: item.code, type: item.type }))) {
            return;
          }
          message.success(formatMessage({ id: 'ResetSuccess' }));
          reload();
        }
      }
    ];
  };

  // 平台在消息管理中未开放的模版，单个租户开放也不生效，不提供开关
  const getTenantOpenActions = item => {
    const state = getTenantOpenState(item);
    if (!canSetTenantOpen || !state || state === 'platformClosed') {
      return [];
    }
    const open = state === 'open';
    return [
      {
        children: formatMessage({ id: open ? 'CloseTenantManage' : 'OpenTenantManage' }),
        confirm: true,
        message: formatMessage({ id: open ? 'CloseTenantManageConfirm' : 'OpenTenantManageConfirm' }),
        onClick: async () => {
          if (!(await request(apis.templateSetTenantOpen, { code: item.code, type: item.type, tenantOpen: !open }))) {
            return;
          }
          message.success(formatMessage({ id: 'SaveSuccess' }));
          reload();
        }
      }
    ];
  };

  return (
    <TablePage
      ref={ref}
      rowKey="key"
      loader={async ({ data }) => {
        const resData = await request(apis.templateList);
        const list = filterTemplatesByType(filterTemplates(resData?.data?.list, data?.keyword), data?.type).map(item =>
          Object.assign({ key: `${item.code}:${item.type}` }, item)
        );
        return { pageData: list, totalCount: list.length };
      }}
      pagination={{ open: false }}
      search={{ name: 'keyword', label: formatMessage({ id: 'Keyword' }), placeholder: formatMessage({ id: 'SearchTemplate' }) }}
      filter={{
        list: [
          {
            type: SuperSelectFilterItem,
            props: {
              name: 'type',
              label: formatMessage({ id: 'TemplateType' }),
              single: true,
              options: [
                { value: 0, label: formatMessage({ id: 'EmailType' }) },
                { value: 1, label: formatMessage({ id: 'SmsType' }) }
              ]
            }
          }
        ]
      }}
      empty={<Empty description={formatMessage({ id: 'NoTemplate' })} />}
      columns={[
        { name: 'name', title: formatMessage({ id: 'TemplateName' }), type: 'mainInfo', primary: false, hover: false },
        {
          name: 'type',
          title: formatMessage({ id: 'TemplateType' }),
          renderType: 'tag',
          getValueOf: item =>
            isSms(item) ? { type: 'info', text: formatMessage({ id: 'SmsType' }) } : { type: 'default', text: formatMessage({ id: 'EmailType' }) }
        },
        { name: 'code', title: formatMessage({ id: 'TemplateCode' }) },
        { name: 'description', title: formatMessage({ id: 'Description' }), renderType: 'description' },
        {
          name: 'customized',
          title: formatMessage({ id: 'Status' }),
          renderType: 'tag',
          getValueOf: item => {
            if (!item.customized) {
              return { type: 'default', text: formatMessage({ id: 'UseSystemTemplate' }) };
            }
            return Number(item.status) === 0
              ? { type: 'success', text: formatMessage({ id: 'Customized' }) }
              : { type: 'warning', text: `${formatMessage({ id: 'Customized' })} · ${formatMessage({ id: 'Disabled' })}` };
          }
        },
        canSetTenantOpen && {
          name: 'tenantOpen',
          title: formatMessage({ id: 'TenantManage' }),
          renderType: 'tag',
          getValueOf: item => {
            const tag = TENANT_OPEN_TAGS[getTenantOpenState(item)];
            return tag ? { type: tag.type, text: formatMessage({ id: tag.id }) } : null;
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
          getValueOf: item => [...getTemplateActions(item), ...getTenantOpenActions(item)]
        }
      ].filter(Boolean)}
    />
  );
});

export default withLocale(({ hasEdit = true, editableTypes = TEMPLATE_TYPES, ...props }) => (
  <TemplateList {...props} hasEdit={hasEdit} editableTypes={editableTypes} />
));
