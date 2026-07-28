const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useState } = React;
const { Flex, Switch, Typography } = antd;

const TenantUserSelectInputModalExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const [single, setSingle] = useState(true);

  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={16}>
        <Flex align="center" gap={8}>
          <Typography.Text>单选</Typography.Text>
          <Switch checked={single} onChange={setSingle} />
        </Flex>
        <Form
          key={single ? 'single' : 'multiple'}
          onSubmit={data => {
            console.log('弹窗选择结果:', data);
          }}>
          <TenantUserSelect.Input
            name="members"
            label={single ? '负责人' : '协作成员'}
            rule="REQ"
            isPopup={false}
            single={single}
            companyName="科技创新有限公司"
            height={520}
            overlayWidth={800}
          />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <SubmitButton type="primary">保存</SubmitButton>
          </div>
        </Form>
      </Flex>
    </PureGlobal>
  );
});

render(<TenantUserSelectInputModalExample />);
