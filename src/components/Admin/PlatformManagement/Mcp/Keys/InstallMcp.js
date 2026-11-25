import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../../withLocale';
import InstallMcpContent from './InstallMcpContent';

/**
 * 安装 MCP 统一入口。
 * - 超管（默认）：弹窗内选归属用户，走 `apis.mcp.keys.create` 为其签发
 * - 自助：`selectUser={false}` + `createApi`（如插件自带 `{prefix}/mcp-keys`），只能给当前登录用户签发
 * - `promptExample` 可覆盖第 3 步示例提问
 */
const InstallMcp = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal', 'components-core:Global@usePreset', 'components-core:Global@useGlobalContext']
})(
  withLocale(({ remoteModules, onSuccess, children, serverName, selectUser = true, createApi, promptExample, ...props }) => {
    const [useModal, usePreset, useGlobalContext] = remoteModules;
    const modal = useModal();
    const { ajax, apis, apiUrl } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const { global: userInfo } = useGlobalContext('userInfo');
    const selfName = userInfo?.nickname || userInfo?.email || userInfo?.phone || '';

    return (
      <Button
        {...props}
        onClick={() => {
          modal({
            title: formatMessage({ id: 'McpInstall' }),
            size: 'large',
            maskClosable: false,
            footer: null,
            children: (
              <InstallMcpContent
                ajax={ajax}
                createApi={createApi || apis.mcp?.keys?.create}
                apiUrl={apiUrl}
                message={message}
                serverName={serverName}
                selectUser={selectUser}
                selfName={selfName}
                promptExample={promptExample}
                onGenerated={() => onSuccess && onSuccess()}
              />
            )
          });
        }}
      >
        {children || formatMessage({ id: 'McpInstall' })}
      </Button>
    );
  })
);

export default InstallMcp;
