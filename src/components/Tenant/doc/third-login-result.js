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
