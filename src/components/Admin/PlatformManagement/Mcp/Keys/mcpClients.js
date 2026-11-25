export const TOKEN_PLACEHOLDER = 'YOUR_MCP_TOKEN';

export const buildMcpUrl = apiUrl => `${String(apiUrl || '').replace(/\/+$/, '')}/mcp`;

/** MCP 凭证：Bearer <keyId>.<secret> */
export const buildMcpToken = ({ id, secret, keyId, appId, secretKey }) => `${id || keyId || appId}.${secret || secretKey}`;

const json = value => JSON.stringify(value, null, 2);

/**
 * 主流 AI 客户端的远程 MCP（Streamable HTTP + Bearer）安装配置。
 * type: command 表示在终端执行，file 表示写入配置文件；path 为配置文件位置提示。
 * @param {{ url: string, token?: string, serverName?: string }} options
 */
export const getMcpClients = ({ url, token, serverName = 'mcp' }) => {
  const bearer = `Bearer ${token || TOKEN_PLACEHOLDER}`;
  const headers = { Authorization: bearer };
  const name = serverName || 'mcp';
  return [
    {
      key: 'cursor',
      label: 'Cursor',
      type: 'file',
      path: '~/.cursor/mcp.json（项目级：<项目>/.cursor/mcp.json）',
      language: 'json',
      content: json({ mcpServers: { [name]: { url, headers } } })
    },
    {
      key: 'workbuddy',
      label: 'WorkBuddy',
      type: 'file',
      path: '~/.workbuddy/mcp.json（合并 mcpServers；或在 WorkBuddy「连接器 → 自定义连接器 → 配置 MCP」中粘贴）\n保存后需在自定义连接器中点击「信任」并「启用」，状态变绿即连接成功',
      language: 'json',
      content: json({ mcpServers: { [name]: { type: 'http', url, headers } } })
    },
    {
      key: 'claude-code',
      label: 'Claude Code',
      type: 'command',
      language: 'bash',
      content: `claude mcp add --transport http ${name} ${url} \\\n  --header "Authorization: ${bearer}"`
    },
    {
      key: 'claude-desktop',
      label: 'Claude Desktop',
      type: 'file',
      path: 'macOS: ~/Library/Application Support/Claude/claude_desktop_config.json\nWindows: %APPDATA%\\Claude\\claude_desktop_config.json（需已安装 Node.js）',
      language: 'json',
      content: json({
        mcpServers: {
          [name]: {
            command: 'npx',
            args: ['-y', 'mcp-remote', url, '--header', 'Authorization:${AUTH_HEADER}'],
            env: { AUTH_HEADER: bearer }
          }
        }
      })
    },
    {
      key: 'vscode',
      label: 'VS Code (GitHub Copilot)',
      type: 'file',
      path: '<项目>/.vscode/mcp.json（或命令面板执行 “MCP: Open User Configuration”）',
      language: 'json',
      content: json({ servers: { [name]: { type: 'http', url, headers } } })
    },
    {
      key: 'windsurf',
      label: 'Windsurf',
      type: 'file',
      path: '~/.codeium/windsurf/mcp_config.json',
      language: 'json',
      content: json({ mcpServers: { [name]: { serverUrl: url, headers } } })
    },
    {
      key: 'cline',
      label: 'Cline / Roo Code',
      type: 'file',
      path: 'Cline 面板 → MCP Servers → Configure → cline_mcp_settings.json',
      language: 'json',
      content: json({ mcpServers: { [name]: { type: 'streamableHttp', url, headers } } })
    },
    {
      key: 'codex',
      label: 'Codex CLI',
      type: 'file',
      path: '~/.codex/config.toml',
      language: 'toml',
      content: `[mcp_servers.${name}]\nurl = "${url}"\nhttp_headers = { Authorization = "${bearer}" }`
    },
    {
      key: 'gemini-cli',
      label: 'Gemini CLI',
      type: 'file',
      path: '~/.gemini/settings.json',
      language: 'json',
      content: json({ mcpServers: { [name]: { httpUrl: url, headers } } })
    },
    {
      key: 'generic',
      label: 'Trae / 其他支持远程 MCP 的客户端',
      type: 'file',
      path: 'Trae：设置 → MCP → 手动添加；其他客户端请在其 MCP 配置中添加',
      language: 'json',
      content: json({ mcpServers: { [name]: { url, headers } } })
    }
  ];
};
