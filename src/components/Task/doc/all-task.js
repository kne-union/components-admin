const { AllTask } = _Task;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { BrowserRouter, Routes, Route } = reactRouterDom;

const AllTaskExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;

  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <AllTask
          baseUrl="/Task"
          pageProps={{
            menu: null,
            menuOpen: false,
            menuFixed: false
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<AllTaskExample />);
