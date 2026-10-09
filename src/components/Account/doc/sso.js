const { default: Account } = _Account;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;
const { Flex, Radio, Space, message } = antd;
const { useMemo, useState } = React;

const baseUrl = '/Account/sso';

const SsoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [mode, setMode] = useState('standalone');
  const preset = useMemo(
    () =>
      Object.assign({}, mockPreset, {
        apis: Object.assign({}, mockPreset.apis, {
          oidc: Object.assign({}, mockPreset.apis.oidc, {
            config: { loader: () => ({ mode, issuer: 'https://main.example.com/oidc', clientId: 'hr-portal' }) }
          })
        }),
        oidc: Object.assign({}, mockPreset.oidc, {
          login: async ({ returnTo }) => {
            message.info(`跳转统一登录，登录后回到：${returnTo}`);
          }
        })
      }),
    [mode]
  );
  return (
    <Flex vertical gap={20}>
      <Flex justify="center">
        <Space>
          <span>认证模式:</span>
          <Radio.Group
            value={mode}
            onChange={e => {
              setMode(e.target.value);
            }}
            options={[
              { label: 'standalone（显示 SSO 按钮）', value: 'standalone' },
              { label: 'central（直接跳转）', value: 'central' }
            ]}
          />
        </Space>
      </Flex>
      <PureGlobal key={mode} preset={preset}>
        <Routes>
          <Route path={`${baseUrl}/*`} element={<Account baseUrl={baseUrl} systemName="企业管理系统" />} />
          <Route path="*" element={<Navigate to={`${baseUrl}/login`} replace />} />
        </Routes>
      </PureGlobal>
    </Flex>
  );
});

render(<SsoExample />);
