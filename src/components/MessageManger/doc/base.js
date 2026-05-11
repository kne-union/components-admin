const { default: MessageManger } = _MessageManger;
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
            path="/MessageManger/message/*"
            element={
              <MessageManger baseUrl="/MessageManger/message" pageProps={{ menuFixed: false }}>
                <Flex gap={8} wrap="wrap">
                  <Button onClick={() => navigate('/MessageManger/message')}>消息模板</Button>
                  <Button onClick={() => navigate('/MessageManger/message/records')}>发送记录</Button>
                </Flex>
              </MessageManger>
            }
          />
          <Route path="*" element={<Navigate to="/MessageManger/message" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);
