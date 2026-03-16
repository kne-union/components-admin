const { default: GroupSelect } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset, groupList } = _mockPreset;

const ReadonlyExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, fields } = FormInfo;
  const { Input } = fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        data={{
          name: '只读项目',
          groups: [
            { code: 'frontend', name: '前端开发' },
            { code: 'backend', name: '后端开发' }
          ]
        }}
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="只读标签选择（无添加/删除功能）"
          column={1}
          list={[
            <Input name="name" label="项目名称" rule="REQ" placeholder="请输入项目名称" />
          ]}
        />
        <GroupSelect
          name="groups"
          label="技能标签"
          placeholder="请选择技能标签"
          groupName="技能标签"
          apis={{
            // 只传 list 接口，不传 create 和 remove，隐藏添加和删除按钮
            list: {
              loader: () => groupList.data
            }
          }}
        />
        <div style={{ marginTop: 16 }}>
          <SubmitButton>提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<ReadonlyExample />);
