const { default: IntlAdmin } = _IntlAdmin;
const { LangType } = IntlAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const LangTypeExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <LangType
          pageProps={{
            menuFixed: false
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<LangTypeExample />);
