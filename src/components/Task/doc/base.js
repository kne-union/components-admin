const { default: Task } = _Task;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useNavigate, Navigate } = reactRouterDom;
const { Button, Flex } = antd;
const { Route, Routes } = reactRouterDom;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const navigate = useNavigate();
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route
            path="/Task/task/*"
            element={
              <Task
                baseUrl="/Task"
                pageProps={{
                  menuFixed: false
                }}>
                <Flex gap={8}>
                  <Button
                    onClick={() => {
                      navigate('/Task/task');
                    }}>
                    我的任务
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/Task/task/all');
                    }}>
                    全部任务
                  </Button>
                </Flex>
              </Task>
            }
          />
          <Route path="/Task/*" element={<Navigate to="/Task/task" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);
