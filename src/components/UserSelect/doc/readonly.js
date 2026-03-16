const { default: UserSelect } = _UserSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const ReadonlyExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form } = FormInfo;

  // 模拟只读场景的初始数据（初始值必须包含 value 和 label）
  const initialValue = {
    projectName: '企业协同平台',
    ownerId: { value: 1, label: '张三' },
    memberIds: [
      { value: 2, label: '李四' },
      { value: 3, label: '王五' },
      { value: 6, label: '孙八' }
    ]
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Form data={initialValue}>
        <FormInfo
          title="项目详情（只读）"
          column={1}
        />
        <UserSelect
          name="ownerId"
          label="项目负责人"
          disabled
        />
        <UserSelect
          name="memberIds"
          label="项目成员"
          disabled
          single={false}
        />
      </Form>
    </PureGlobal>
  );
});

render(<ReadonlyExample />);
