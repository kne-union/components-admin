const { MfaSetting } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const MfaSettingExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <MfaSetting apis={mockPreset.apis.tenant.mfaSetting} />
      </Layout>
    </PureGlobal>
  );
});

render(<MfaSettingExample />);
