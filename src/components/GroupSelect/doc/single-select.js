const { default: GroupSelect } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const SingleSelectExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, fields } = FormInfo;
  const { Input } = fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        data={{
          name: '数据分析项目',
          primaryGroup: 'ai'
        }}
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="主技能标签选择"
          column={1}
          list={[
            <Input name="name" label="项目名称" rule="REQ" placeholder="请输入项目名称" />
          ]}
        />
        <GroupSelect
          name="primaryGroup"
          label="主技能标签"
          single
          rule="REQ"
          placeholder="请选择一个主技能标签"
        />
        <div style={{ marginTop: 16 }}>
          <SubmitButton>提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<SingleSelectExample />);
