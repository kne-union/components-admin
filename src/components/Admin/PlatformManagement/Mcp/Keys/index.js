import { createWithRemoteLoader } from '@kne/remote-loader';
import { useCallback, useRef } from 'react';
import { useIntl } from '@kne/react-intl';
import BizUnit, { TablePageRender } from '@components/BizUnit';
import withLocale from '../../../withLocale';
import InstallMcp from './InstallMcp';
import RemoveSecret from './RemoveSecret';

const getColumns = ({ formatMessage, selectUser = true }) =>
  [
    {
      name: 'name',
      title: formatMessage({ id: 'McpSecretName' }),
      renderType: 'main'
    },
    selectUser && {
      name: 'userName',
      title: formatMessage({ id: 'McpBelongUser' }),
      width: 200
    },
    {
      name: 'id',
      title: 'Key ID',
      renderType: 'id'
    },
    {
      name: 'secret',
      title: 'Secret'
    },
    {
      name: 'createdAt',
      title: formatMessage({ id: 'McpCreatedAt' }),
      format: 'datetime'
    }
  ].filter(Boolean);

/**
 * MCP 密钥列表。
 * - 超管（默认）：列表默认全部用户，安装 MCP 时选归属用户；走 `apis.mcp.keys`（宿主 `{mcpAdminPrefix}/mcp-keys`）
 * - 自助：`selectUser={false}` + `keyApis`（插件自带 `{prefix}/mcp-keys`），只能看、建、删自己的
 */
const Keys = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, pageProps = {}, serverName = 'mcp', withPage = true, selectUser = true, keyApis, promptExample }) => {
    const [usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage } = useIntl();
    const tableRef = useRef(null);
    const resolvedApis = keyApis || apis.mcp?.keys || {};
    const reload = useCallback(() => {
      tableRef.current?.current?.reload?.();
    }, []);

    return (
      <BizUnit
        isNext
        allowKeywordSearch={false}
        name={selectUser ? 'admin-mcp-keys' : 'self-mcp-keys'}
        page={{
          title: formatMessage({ id: 'NavMcpKeys' }),
          ...pageProps
        }}
        apis={{
          list: {
            loader: async ({ data, params }) => {
              const pagination = Object.assign({}, data, params);
              const { data: resData } = await ajax(
                Object.assign({}, resolvedApis.list, {
                  params: {
                    perPage: pagination.perPage,
                    currentPage: pagination.currentPage
                  }
                })
              );
              if (resData.code !== 0) {
                return { pageData: [], totalCount: 0 };
              }
              const { pageData = [], totalCount = 0 } = resData.data || {};
              return {
                totalCount,
                pageData: pageData.map(({ user, ...item }) =>
                  Object.assign({}, item, {
                    userName: user?.nickname || user?.email || user?.phone || item.subjectId
                  })
                )
              };
            }
          }
        }}
        getColumns={() => getColumns({ formatMessage, selectUser })}
        getActionList={({ data, ...rest }) => [
          {
            type: 'link',
            buttonComponent: RemoveSecret,
            children: formatMessage({ id: 'McpDeleteSecret' }),
            data,
            removeApi: resolvedApis.remove,
            onSuccess: reload,
            danger: true,
            message: formatMessage({ id: 'McpDeleteSecretConfirm' }),
            ...rest
          }
        ]}
        options={{
          bizName: formatMessage({ id: 'NavMcpKeys' }),
          tableProps: {
            pagination: {
              open: true,
              paramsType: 'params',
              showSizeChanger: true,
              showQuickJumper: true
            },
            buttonGroup: {
              list: [
                {
                  type: 'primary',
                  buttonComponent: InstallMcp,
                  children: formatMessage({ id: 'McpInstall' }),
                  serverName,
                  selectUser,
                  createApi: resolvedApis.create,
                  promptExample,
                  onSuccess: reload
                }
              ]
            }
          }
        }}
      >
        {renderProps => {
          tableRef.current = renderProps.tableOptions?.ref || null;
          return <TablePageRender {...renderProps} withPage={withPage} />;
        }}
      </BizUnit>
    );
  })
);

export default Keys;
export { InstallMcp, RemoveSecret, getColumns };
