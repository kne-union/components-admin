const { default: GroupSelect } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const WithInitialValueExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, CancelButton, fields } = FormInfo;
  const { Input } = fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        data={{
          name: '全栈开发项目',
          groups: [
            { code: 'frontend', name: '前端开发' },
            { code: 'backend', name: '后端开发' },
            { code: 'database', name: '数据库' }
          ]
        }}
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="编辑项目技能标签"
          column={1}
          list={[
            <Input name="name" label="项目名称" rule="REQ" placeholder="请输入项目名称" />
          ]}
        />
        <GroupSelect
          name="groups"
          label="技能标签"
          placeholder="请选择技能标签"
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
