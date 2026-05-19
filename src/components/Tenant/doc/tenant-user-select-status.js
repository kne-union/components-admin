const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Flex, Typography } = antd;

const TenantUserSelectStatusExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { Text } = Typography;

  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={16}>
        <Text type="secondary">仅展示状态为「开启」的成员（userStatus=&quot;open&quot;，亦兼容 active）</Text>
        <Form
          onSubmit={data => {
            console.log('交接人:', data);
          }}>
          <TenantUserSelect
            name="handoverUser"
            label="工作交接人"
            rule="REQ"
            userStatus="open"
            companyName="科技创新有限公司"
          />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <SubmitButton type="primary">确认</SubmitButton>
          </div>
        </Form>
      </Flex>
    </PureGlobal>
  );
});

render(<TenantUserSelectStatusExample />);
