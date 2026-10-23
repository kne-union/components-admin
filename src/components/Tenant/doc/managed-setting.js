const { Setting } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/TenantManaged';
const settingBaseUrl = `${baseUrl}/setting`;
const pageProps = { menuFixed: false };

const { userInfo } = mockPreset.global;
const managedPreset = Object.assign({}, mockPreset, {
  global: Object.assign({}, mockPreset.global, {
    userInfo: Object.assign({}, userInfo, {
      tenant: Object.assign({}, userInfo.tenant, {
        name: '华南物流集团（宿主）',
        options: {
          managedBy: { issuer: 'https://hr.example.com/oidc', hostTenantId: 'host-tenant-88', syncedAt: '2026-10-22T10:00:00.000Z' }
        }
      })
    })
  })
});

const ManagedSettingExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={managedPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path={`${settingBaseUrl}/*`} element={<Setting pageProps={pageProps} baseUrl={baseUrl} />} />
          <Route path="*" element={<Navigate to={`${settingBaseUrl}/org`} replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<ManagedSettingExample />);
