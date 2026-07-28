const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useState } = React;
const { Flex, Button, Typography } = antd;

const TenantUserSelectInputFieldExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [value, setValue] = useState(null);

  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={12} style={{ maxWidth: 480 }}>
        <Typography.Text type="secondary">
          TenantUserSelect.Input.Field 为纯控件，不依赖 Form，通过 value / onChange 受控
        </Typography.Text>
        <TenantUserSelect.Input.Field
          value={value}
          onChange={setValue}
          isPopup
          single
          companyName="科技创新有限公司"
          placeholder="请选择成员"
        />
        <Typography.Paragraph>
          <Typography.Text strong>当前值：</Typography.Text>
          <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{JSON.stringify(value, null, 2)}</pre>
        </Typography.Paragraph>
        <Button onClick={() => setValue(null)}>清空</Button>
      </Flex>
    </PureGlobal>
  );
});

render(<TenantUserSelectInputFieldExample />);
