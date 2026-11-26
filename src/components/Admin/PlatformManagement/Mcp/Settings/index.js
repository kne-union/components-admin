import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button, Switch, Tag } from 'antd';
import { useIntl } from '@kne/react-intl';
import { useRef, useState } from 'react';
import BizUnit, { TablePageRender } from '@components/BizUnit';
import { getMethodTagColor } from '../../../../Signature/openApiScopes';
import withLocale from '../../../withLocale';
import FormInner from './FormInner';

const parseScenariosText = text =>
  String(text || '')
    .split(/[,，\n]/)
    .map(s => s.trim())
    .filter(Boolean);

const rowKeyOf = item => `${item.method}:${item.path}`;

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

/**
 * 平台 MCP 设置：对接 @kne/fastify-mcp admin catalog / allowlist。
 * 菜单显隐由 getSuperAdminInfo.setting.mcpEnabled 控制（宿主 getAdminSetting 注入）。
 * 列表来自 catalog（实时 swagger + allowlist）；接口增删/场景默认值由服务端 seed 在启动时对账，无需手动「重新同步」。
 */
const McpSettings = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:TablePage@useSelectedRow', 'components-core:Filter']
})(
  withLocale(({ remoteModules, pageProps = {} }) => {
    const [usePreset, useSelectedRow, Filter] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields;
    const { ajax, apis } = usePreset();
    const { formatMessage } = useIntl();
    const { message } = App.useApp();
    const tableRef = useRef(null);
    const dataRef = useRef([]);
    const [togglingKey, setTogglingKey] = useState(null);
    const { selectedRowKeys, selectedRows, setSelectedRowKeys, clearSelectedRows } = useSelectedRow({ rowKey: 'rowKey' });

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

    const batchSetEnabled = async (rows, enabled) => {
      if (!rows?.length) {
        return;
      }
      const { data: resData } = await ajax(
        Object.assign({}, apis.mcp.allowlist.batch, {
          data: {
            items: rows.map(item => ({
              method: item.method,
              path: item.path,
              operationId: item.operationId,
              scenarios: item.scenarios || [],
              confirm: !!item.confirm,
              enabled
            }))
          }
        })
      );
      if (resData.code !== 0) {
        return;
      }
      message.success(formatMessage({ id: enabled ? 'McpBatchEnabledSuccess' : 'McpBatchDisabledSuccess' }, { count: rows.length }));
      clearSelectedRows();
      reloadTable();
    };

    return (
      <BizUnit
        isNext
        allowKeywordSearch
        name="platform-mcp-settings"
        page={{
          title: formatMessage({ id: 'NavMcpSettings' }),
          ...pageProps
        }}
        apis={{
          list: Object.assign({}, apis.mcp.catalog.operations)
        }}
        filter={{
          list: [
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'scenario',
                label: formatMessage({ id: 'McpScenarios' }),
                api: {
                  loader: async () => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.mcp.catalog.operations, {
                        params: { perPage: 5000, currentPage: 1 }
                      })
                    );
                    const names = new Set();
                    (resData.data?.pageData || []).forEach(item => {
                      const list = item.scenarios || [];
                      if (!list.length) {
                        names.add(formatMessage({ id: 'McpScenariosEmpty' }));
                        return;
                      }
                      list.forEach(name => names.add(String(name)));
                    });
                    return {
                      pageData: [...names].sort().map(value => ({ value, label: value }))
                    };
                  }
                }
              }
            },
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'enabled',
                label: formatMessage({ id: 'McpEnabled' }),
                single: true,
                options: [
                  { value: 'true', label: formatMessage({ id: 'McpEnabledYes' }) },
                  { value: 'false', label: formatMessage({ id: 'McpEnabledNo' }) }
                ]
              }
            }
          ]
        }}
        options={{
          bizName: formatMessage({ id: 'NavMcpSettings' }),
          keywordFilterName: 'keyword',
          keywordFilterLabel: formatMessage({ id: 'McpKeyword' }),
          // 返回值直接并进请求 params（扁平：scenario=a,b）
          mapFilterValue: (value, getFilterValue) => {
            const filter = getFilterValue(value) || {};
            const pick = v => (v && typeof v === 'object' ? v.value : v);
            const pickList = v => {
              if (v == null || v === '') {
                return [];
              }
              const arr = Array.isArray(v) ? v : [v];
              return arr.map(pick).filter(item => item != null && item !== '').map(String);
            };
            const params = {};
            const keyword = pick(filter.keyword);
            const scenarios = pickList(filter.scenario);
            const enabled = pick(filter.enabled);
            if (keyword) {
              params.keyword = String(keyword);
            }
            if (scenarios.length) {
              params.scenario = scenarios.join(',');
            }
            if (enabled === 'true' || enabled === true) {
              params.enabled = true;
            } else if (enabled === 'false' || enabled === false) {
              params.enabled = false;
            }
            return params;
          },
          tableProps: {
            rowKey: 'rowKey',
            pagination: {
              open: true,
              paramsType: 'params',
              showSizeChanger: true,
              showQuickJumper: true
            },
            rowSelection: {
              type: 'checkbox',
              selectedRowKeys,
              allowSelectedAll: true,
              onChange: keys => setSelectedRowKeys(keys, dataRef.current || [])
            },
            selectedRows,
            batchActions: [
              {
                key: 'enable',
                label: formatMessage({ id: 'McpBatchEnable' }),
                onClick: ({ selectedRows: rows }) => batchSetEnabled(rows, true)
              },
              {
                key: 'disable',
                label: formatMessage({ id: 'McpBatchDisable' }),
                onClick: ({ selectedRows: rows }) => batchSetEnabled(rows, false)
              }
            ],
            dataFormat: data => {
              const list = (data?.pageData || []).map(item =>
                Object.assign({}, item, {
                  rowKey: rowKeyOf(item)
                })
              );
              dataRef.current = list;
              return {
                list,
                total: data?.totalCount ?? list.length,
                data
              };
            }
          }
        }}
        getColumns={() => [
          {
            name: 'method',
            title: formatMessage({ id: 'McpMethod' }),
            width: 100,
            getValueOf: item => <Tag color={getMethodTagColor(item.method)}>{item.method}</Tag>
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
            width: 120,
            fixed: 'right',
            getValueOf: item => {
              const key = rowKeyOf(item);
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
