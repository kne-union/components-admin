const { Callback } = _Oidc;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Result } = antd;
const { useState } = React;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [result, setResult] = useState(null);
  return (
    <PureGlobal preset={mockPreset}>
      {result ? <Result status="success" title="登录完成" subTitle={`即将返回：${result.returnTo}`} /> : <Callback onSuccess={setResult} />}
    </PureGlobal>
  );
});

render(<BaseExample />);
