const { default: Editor } = _Editor;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;

  return (
    <PureGlobal>
      <Form
        onSubmit={(data) => {
          console.log('提交内容:', data);
        }}
      >
        <Editor
          name="content"
          label="文章内容"
          rule="REQ"
          placeholder="请输入文章内容..."
          height={300}
        />
        <div style={{ marginTop: 16 }}>
          <SubmitButton>提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<BaseExample />);
