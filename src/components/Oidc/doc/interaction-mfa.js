const { Interaction } = _Oidc;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Flex, Segmented } = antd;
const { useState } = React;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [uid, setUid] = useState('demo-mfa');
  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={16}>
        <Segmented
          value={uid}
          onChange={setUid}
          options={[
            { label: '已绑定手机号', value: 'demo-mfa' },
            { label: '未绑定手机号', value: 'demo-mfa-no-phone' }
          ]}
        />
        <Interaction key={uid} uid={uid} systemName="统一登录中心" />
      </Flex>
    </PureGlobal>
  );
});

render(<BaseExample />);
