import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button, Switch, Tag } from 'antd';
import { useIntl } from '@kne/react-intl';
import { useRef, useState } from 'react';
import BizUnit, { TablePageRender } from '@components/BizUnit';
import withLocale from '../../../withLocale';
import FormInner from './FormInner';

const parseScenariosText = text =>
  String(text || '')
    .split(/[,，\n]/)
    .map(s => s.trim())
    .filter(Boolean);

const EditAllowlistButton = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, onSuccess, apis: _apis, options, getFormInner, fetchOptions, children, ...props }) => {
    const [useFormModal, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage } = useIntl();
    const { message } = App.useApp();
    const formModal = useFormModal();

    return (
      <Button
        {...props}
        onClick={() => {
          formModal({
            title: formatMessage({ id: 'McpEdit' }),
            size: 'small',
            autoClose: true,
            formProps: {
              data: {
                method: data.method,
                path: data.path,
                summary: data.summary || data.operationId || '',
                scenariosText: (data.scenarios || []).join(', '),
                confirm: !!data.confirm
              },
              onSubmit: async formData => {
                const scenarios = parseScenariosText(formData.scenariosText);
                const { data: resData } = await ajax(
                  Object.assign({}, apis.mcp.allowlist.create, {
                    data: {
                      method: data.method,
                      path: data.path,
                      operationId: data.operationId,
                      scenarios,
                      confirm: !!formData.confirm,
                      enabled: true
                    }
                  })
                );
                if (resData.code !== 0) {
                  return false;
                }
                message.success(formatMessage({ id: 'McpSaved' }));
                onSuccess && onSuccess();
              }
            },
            children: <FormInner />
          });
        }}
      >
        {children ?? formatMessage({ id: 'McpEdit' })}
      </Button>
    );
  })
);

const SyncCatalogButton = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, onSuccess, ...props }) => {
    const [LoadingButton, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage } = useIntl();
    const { message } = App.useApp();
    return (
      <LoadingButton
        {...props}
        type="primary"
        title={formatMessage({ id: 'McpSyncTip' })}
        onClick={async () => {
          const { data: resData } = await ajax(Object.assign({}, apis.mcp.allowlist.sync));
          // 业务仓 transformResponse 用 results；mock / 未转换时用 data
          if (resData.code !== 0 && resData.code !== 200) {
            return;
          }
          const result = resData.results || resData.data || {};
          message.success(
            formatMessage(
              { id: 'McpSyncSuccess' },
              {
                activeCount: Number(result.activeCount) || 0,
                orphanCount: Number(result.orphanCount) || 0
              }
            )
          );
          onSuccess && onSuccess();
        }}
      >
        {formatMessage({ id: 'McpSync' })}
      </LoadingButton>
    );
  })
);

/**
 * 平台 MCP 设置：对接 @kne/fastify-mcp admin catalog / allowlist。
 * 菜单显隐由 getSuperAdminInfo.setting.mcpEnabled 控制（宿主 getAdminSetting 注入）。
 */
const McpSettings = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, pageProps = {} }) => {
    const [usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage } = useIntl();
    const { message } = App.useApp();
    const tableRef = useRef(null);
    const [togglingKey, setTogglingKey] = useState(null);

    const reloadTable = () => tableRef.current?.current?.reload?.();

    const upsertAllowlist = async (item, patch) => {
      const { data: resData } = await ajax(
        Object.assign({}, apis.mcp.allowlist.create, {
          data: {
            method: item.method,
            path: item.path,
            operationId: item.operationId,
            scenarios: item.scenarios || [],
            confirm: !!item.confirm,
            enabled: item.enabled !== false,
            ...patch
          }
        })
      );
      return resData;
    };

    return (
      <BizUnit
        isNext
        allowKeywordSearch={false}
        name="platform-mcp-settings"
        page={{
          title: formatMessage({ id: 'NavMcpSettings' }),
          ...pageProps
        }}
        apis={{
          list: Object.assign({}, apis.mcp.catalog.operations)
        }}
        getColumns={() => [
          {
            name: 'method',
            title: formatMessage({ id: 'McpMethod' }),
            width: 90
          },
          {
            name: 'path',
            title: formatMessage({ id: 'McpPath' }),
            renderType: 'main'
          },
          {
            name: 'summary',
            title: formatMessage({ id: 'McpSummary' }),
            renderType: 'description',
            ellipsis: true,
            getValueOf: item => item.summary || item.operationId || '-'
          },
          {
            name: 'scenarios',
            title: formatMessage({ id: 'McpScenarios' }),
            renderType: 'list',
            maxCount: 4,
            renderItem: text => <Tag>{text}</Tag>,
            getValueOf: item => {
              const list = item.scenarios || [];
              return list.length ? list : [formatMessage({ id: 'McpScenariosEmpty' })];
            }
          },
          {
            name: 'confirm',
            title: formatMessage({ id: 'McpConfirm' }),
            width: 100,
            getValueOf: item => (item.confirm ? formatMessage({ id: 'Yes' }) : formatMessage({ id: 'No' }))
          },
          {
            name: 'enabled',
            title: formatMessage({ id: 'McpEnabled' }),
            width: 100,
            fixed: 'right',
            getValueOf: item => {
              const key = `${item.method}:${item.path}`;
              return (
                <Switch
                  checked={!!item.enabled}
                  loading={togglingKey === key}
                  onChange={async checked => {
                    setTogglingKey(key);
                    try {
                      const resData = await upsertAllowlist(item, { enabled: checked });
                      if (resData.code !== 0) {
                        return;
                      }
                      message.success(formatMessage({ id: checked ? 'McpEnabledSuccess' : 'McpDisabledSuccess' }));
                      reloadTable();
                    } finally {
                      setTogglingKey(null);
                    }
                  }}
                />
              );
            }
          }
        ]}
        getActionList={({ data, ...props }) => [
          {
            ...props,
            data,
            type: 'link',
            buttonComponent: EditAllowlistButton
          }
        ]}
        options={{
          bizName: formatMessage({ id: 'NavMcpSettings' }),
          tableProps: {
            pagination: { open: false },
            dataFormat: data => ({
              list: data?.pageData || [],
              total: data?.totalCount ?? (data?.pageData || []).length,
              data
            }),
            buttonGroup: {
              list: [
                {
                  buttonComponent: SyncCatalogButton,
                  type: 'primary',
                  onSuccess: reloadTable
                }
              ]
            }
          }
        }}
      >
        {props => {
          tableRef.current = props.tableOptions?.ref;
          return <TablePageRender {...props} />;
        }}
      </BizUnit>
    );
  })
);

export default McpSettings;
