const { default: MessageQueue } = _MessageQueue;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useNavigate, Navigate, Route, Routes } = reactRouterDom;
const { Button, Flex } = antd;

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
            path="/MessageQueue/mq/*"
            element={
              <MessageQueue baseUrl="/MessageQueue/mq" pageProps={{ menuFixed: false }}>
                <Flex gap={8} wrap="wrap">
                  <Button onClick={() => navigate('/MessageQueue/mq')}>仪表盘</Button>
                  <Button onClick={() => navigate('/MessageQueue/mq/messages')}>消息列表</Button>
                  <Button onClick={() => navigate('/MessageQueue/mq/dead-letter')}>死信队列</Button>
                  <Button onClick={() => navigate('/MessageQueue/mq/traces')}>轨迹追踪</Button>
                  <Button onClick={() => navigate('/MessageQueue/mq/tools')}>队列工具</Button>
                </Flex>
              </MessageQueue>
            }
          />
          <Route path="*" element={<Navigate to="/MessageQueue/mq" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);
