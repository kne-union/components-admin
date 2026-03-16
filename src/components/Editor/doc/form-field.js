const { default: Editor } = _Editor;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const FormFieldExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, CancelButton, fields } = FormInfo;
  const { Input, Select } = fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        data={{
          title: '如何使用富文本编辑器',
          category: 'tutorial',
          content: '<h2>欢迎使用富文本编辑器</h2><p>这是一个功能强大的富文本编辑器组件。</p><ul><li>支持文本格式化</li><li>支持图片上传</li><li>支持表格插入</li></ul>'
        }}
        onSubmit={(data) => {
          console.log('文章数据:', data);
        }}
      >
        <FormInfo
          title="文章信息"
          column={2}
          list={[
            <Input name="title" label="文章标题" rule="REQ" placeholder="请输入文章标题" />,
            <Select
              name="category"
              label="文章分类"
              rule="REQ"
              options={[
                { label: '教程', value: 'tutorial' },
                { label: '技术分享', value: 'tech' },
                { label: '产品介绍', value: 'product' },
                { label: '新闻动态', value: 'news' }
              ]}
            />
          ]}
        />
        <Editor
          name="content"
          label="文章内容"
          rule="REQ"
          placeholder="请输入文章内容，支持富文本格式..."
          height={400}
          block
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <CancelButton style={{ marginRight: 8 }}>取消</CancelButton>
          <SubmitButton type="primary">发布文章</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<FormFieldExample />);
