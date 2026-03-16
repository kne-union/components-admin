const { default: UserSelect } = _UserSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const WithInitialValueExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, CancelButton } = FormInfo;

  // 模拟编辑场景的初始数据（初始值必须包含 value 和 label）
  const initialValue = {
    projectName: '智能办公系统 V2.0',
    ownerId: { value: 2, label: '李四' },
    memberIds: [
      { value: 3, label: '王五' },
      { value: 6, label: '孙八' },
      { value: 7, label: '周九' }
    ]
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        data={initialValue}
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="编辑项目"
          column={1}
        />
        <UserSelect
          name="ownerId"
          label="项目负责人"
          rule="REQ"
          placeholder="请选择项目负责人"
        />
        <UserSelect
          name="memberIds"
          label="项目成员"
          placeholder="请选择项目成员"
          single={false}
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <CancelButton style={{ marginRight: 8 }}>取消</CancelButton>
          <SubmitButton type="primary">保存</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<WithInitialValueExample />);
