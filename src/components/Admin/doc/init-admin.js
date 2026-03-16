const { InitAdmin } = _Admin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const InitAdminExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <InitAdmin baseUrl="/Admin/admin" />
      </Layout>
    </PureGlobal>
  );
});

render(<InitAdminExample />);
