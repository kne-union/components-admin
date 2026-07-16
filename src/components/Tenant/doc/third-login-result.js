const { ThirdLoginResult } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate, useNavigate, useSearchParams } = reactRouterDom;
const { Flex, Segmented, Typography } = antd;
const { WechatWorkOutlined, DingdingOutlined } = icons;

const baseUrl = '/third-login-result';
const redirect = encodeURIComponent('https://example.com/home');
const configProps = {
  corpId: 'ding-corp-id',
  clientId: 'ding-client-id'
};

const PLATFORM_URLS = {
  wecom: `${baseUrl}?platform=wecom&code=mock-wecom-auth-code&message=success&redirect=${redirect}&tenantId=1`,
  dingtalk: `${baseUrl}?platform=dingtalk&code=200&message=success&redirect=${redirect}&corpId=${configProps.corpId}&clientId=${configProps.clientId}&tenantId=1`
};

const PLATFORM_OPTIONS = [
  {
    value: 'wecom',
    label: (
      <Flex align="center" gap={6}>
        <WechatWorkOutlined />
        企业微信
      </Flex>
    )
  },
  {
    value: 'dingtalk',
    label: (
      <Flex align="center" gap={6}>
        <DingdingOutlined />
        钉钉
      </Flex>
    )
  }
];

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
      对接说明（结果页 ThirdLoginResult）
    </Typography.Text>
    <Flex vertical gap={4}>
      <Typography.Text strong style={{ fontSize: 12 }}>
        企业微信
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.7 }}>
        对接要求：回跳 URL 必传 platform=wecom、tenantId、code（OAuth 授权码）；可选 redirect、message（中间页状态文案，不参与业务接口）。
        <br />
        对接流程：企微 OAuth 回跳 → URL 上的 code 即为 auth code → 调用 thirdLoginResult → 成功后写入 X-Third-Login-Token → 若有 redirect 则跳转业务页。
      </Typography.Text>
    </Flex>
    <Flex vertical gap={4}>
      <Typography.Text strong style={{ fontSize: 12 }}>
        钉钉
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.7 }}>
        对接要求：回跳 URL 必传 platform=dingtalk、tenantId、corpId、clientId；可选 redirect、message。注意 URL 上的 code 为状态码（如
        200），不是授权码；页面必须在钉钉客户端内打开。
        <br />
        对接流程：钉钉回跳结果页 → 用 corpId/clientId 调用 dingtalk-jsapi requestAuthCode 获取真实 auth code → 调用 thirdLoginResult →
        写入 token → 若有 redirect 则跳转业务页。
      </Typography.Text>
    </Flex>
  </Flex>
);

const PlatformSwitcher = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform') === 'dingtalk' ? 'dingtalk' : 'wecom';

  return (
    <Flex
      align="center"
      justify="space-between"
      wrap="wrap"
      gap={12}
      style={{
        padding: '12px 16px',
        borderRadius: 12,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.96) 100%)',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
      }}
    >
      <Flex vertical gap={2} style={{ minWidth: 180 }}>
        <Typography.Text strong style={{ fontSize: 13, color: 'rgba(15,23,42,0.88)' }}>
          登录结果预览
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
          切换平台以验证回跳参数与授权流程
        </Typography.Text>
      </Flex>
      <Segmented
        size="middle"
        value={platform}
        options={PLATFORM_OPTIONS}
        onChange={value => navigate(PLATFORM_URLS[value])}
      />
    </Flex>
  );
};

const ThirdLoginResultExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={20} style={{ minHeight: '100%' }}>
        <DocPanel />
        <PlatformSwitcher />
        <Routes>
          <Route path={baseUrl} element={<ThirdLoginResult />} />
          <Route path="*" element={<Navigate to={PLATFORM_URLS.wecom} replace />} />
        </Routes>
      </Flex>
    </PureGlobal>
  );
});

render(<ThirdLoginResultExample />);
