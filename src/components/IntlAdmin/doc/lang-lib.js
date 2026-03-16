const { default: IntlAdmin } = _IntlAdmin;
const { LangLib } = IntlAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const LangLibExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <LangLib
          pageProps={{
            menuFixed: false
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<LangLibExample />);
