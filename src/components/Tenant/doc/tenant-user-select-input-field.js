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
  // 三个一级组织各禁用一人，点任意一级组织都能看到置灰项：
  // 技术研发中心→张伟；产品设计中心→刘芳；运营中心→周洋
  const disabledIds = ['user-1', 'user-4', 'user-7'];

  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={12} style={{ maxWidth: 520 }}>
        <Typography.Text type="secondary">
          请先在左侧组织树点击「技术研发中心」（不要点灰色的公司根节点）。成员列表中「张伟」应置灰不可选；也可点「产品设计中心」看「刘芳」、「运营中心」看「周洋」。
        </Typography.Text>
        <TenantUserSelect.Input.Field
          value={value}
          onChange={setValue}
          isPopup={false}
          single
          companyName="科技创新有限公司"
          placeholder="请选择成员"
          disabledIds={disabledIds}
          height={420}
          overlayWidth={760}
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
