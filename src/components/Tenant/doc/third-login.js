const { ThirdLogin } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;
const { Flex, Typography } = antd;

const baseUrl = '/third-login';

const DocPanel = () => (
  <Flex
    vertical
    gap={12}
    style={{
      padding: '14px 16px',
      borderRadius: 12,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.96) 100%)',
      border: '1px solid rgba(15, 23, 42, 0.08)',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
    }}
  >
    <Typography.Text strong style={{ fontSize: 13, color: 'rgba(15,23,42,0.88)' }}>
      对接说明（入口页 ThirdLogin）
    </Typography.Text>
    <Flex vertical gap={4}>
      <Typography.Text strong style={{ fontSize: 12 }}>
        对接要求
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.7 }}>
        · 通用：URL 必传 platform（wecom / dingtalk）、tenantId；可选 redirect（登录成功后业务回跳地址）。租户需已在后台完成对应平台的组织关联/应用配置。
        <br />
        · 企业微信：配置企微自建应用（AgentId 等），授权回调域名需指向本系统的 third-login-result 页。
        <br />
        · 钉钉：配置钉钉企业内部应用，需准备 corpId、clientId（AppKey）；登录结果页须在钉钉客户端内打开（依赖 JSAPI）。
      </Typography.Text>
    </Flex>
    <Flex vertical gap={4}>
      <Typography.Text strong style={{ fontSize: 12 }}>
        对接流程
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.7 }}>
        1. 业务方打开 /third-login?platform=wecom|dingtalk&tenantId=xxx&redirect=编码后的业务地址
        <br />
        2. 组件调用 thirdLogin 接口，获取平台 OAuth 授权链接 redirectUrl 并跳转
        <br />
        3. 用户在企微/钉钉完成授权后，平台回跳至 /third-login-result
        <br />
        4. 结果页换取登录凭证后写入 token，再跳转 redirect 业务页
      </Typography.Text>
    </Flex>
  </Flex>
);

const ThirdLoginExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={20} style={{ minHeight: '100%' }}>
        <DocPanel />
        <Routes>
          <Route path={baseUrl} element={<ThirdLogin />} />
          <Route path="*" element={<Navigate to={`${baseUrl}?platform=wecom&tenantId=1`} replace />} />
        </Routes>
      </Flex>
    </PureGlobal>
  );
});

render(<ThirdLoginExample />);
