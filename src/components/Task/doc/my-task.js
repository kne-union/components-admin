const { MyTask } = _Task;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { BrowserRouter } = reactRouterDom;
const { Button } = antd;

const MyTaskExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;

  // 自定义手动任务的操作按钮
  const getManualTaskAction = data => {
    return props => (
      <Button
        {...props}
        onClick={() => {
          console.log('完成任务:', data);
          props.onSuccess?.();
        }}>
        完成任务
      </Button>
    );
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <MyTask
          baseUrl="/Task"
          getManualTaskAction={getManualTaskAction}
          pageProps={{
            menuOpen:false,
            menuFixed: false
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<MyTaskExample />);
