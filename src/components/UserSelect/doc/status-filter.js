const { default: UserSelect } = _UserSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const { Space } = antd;

const StatusFilterExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;

  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Form
          onSubmit={(data) => {
            console.log('活跃用户:', data);
          }}
        >
          <FormInfo title="仅选择活跃用户" column={1} />
          <UserSelect
            name="activeUserId"
            label="活跃用户"
            placeholder="仅显示状态正常的用户"
            status={0}
          />
          <div style={{ marginTop: 16 }}>
            <SubmitButton size="small" type="primary">确认</SubmitButton>
          </div>
        </Form>

        <Form
          onSubmit={(data) => {
            console.log('全部用户:', data);
          }}
        >
          <FormInfo title="选择全部用户（不限状态）" column={1} />
          <UserSelect
            name="allUserId"
            label="全部用户"
            placeholder="显示所有状态的用户"
            status={null}
          />
          <div style={{ marginTop: 16 }}>
            <SubmitButton size="small" type="primary">确认</SubmitButton>
          </div>
        </Form>
      </Space>
    </PureGlobal>
  );
});

render(<StatusFilterExample />);
