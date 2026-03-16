const { default: Editor } = _Editor;
const { createWithRemoteLoader } = remoteLoader;

const ValidationExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, fields } = FormInfo;
  const { Input } = fields;

  return (
    <PureGlobal>
      <Form
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="带校验规则的表单"
          column={1}
          list={[
            <Input name="title" label="标题" rule="REQ LEN-5-50" placeholder="标题长度5-50个字符" />
          ]}
        />
        <Editor
          name="content"
          label="内容"
          rule="REQ"
          placeholder="请输入内容，必填字段"
          height={250}
          tips="内容为必填项，请输入文章正文"
          block
        />
        <div style={{ marginTop: 16 }}>
          <SubmitButton>提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<ValidationExample />);
