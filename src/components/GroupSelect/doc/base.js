const { default: GroupSelect } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, CancelButton, fields } = FormInfo;
  const { Input } = fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="技能标签选择"
          column={1}
          list={[
            <Input name="name" label="项目名称" rule="REQ" placeholder="请输入项目名称" />
          ]}
        />
        <GroupSelect
          name="groups"
          label="技能标签"
          rule="REQ"
          placeholder="请选择技能标签"
          groupName="技能标签"
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <CancelButton style={{ marginRight: 8 }}>取消</CancelButton>
          <SubmitButton type="primary">提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<BaseExample />);
