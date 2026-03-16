const { default: Editor } = _Editor;
const { createWithRemoteLoader } = remoteLoader;

const ReadonlyExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, fields } = FormInfo;
  const { Input } = fields;

  const articleContent = `
<h2>产品发布公告</h2>
<p>我们很高兴地宣布，新版本的富文本编辑器已经上线！</p>
<h3>主要功能</h3>
<ul>
  <li><strong>文本格式化</strong>：支持加粗、斜体、下划线等样式</li>
  <li><strong>段落排版</strong>：标题、引用、代码块等</li>
  <li><strong>列表支持</strong>：有序列表和无序列表</li>
  <li><strong>图片上传</strong>：支持拖拽或粘贴上传图片</li>
  <li><strong>表格插入</strong>：方便地创建和编辑表格</li>
</ul>
<h3>使用示例</h3>
<blockquote>
  <p>这是一个引用文本，通常用于强调重要内容。</p>
</blockquote>
<p>感谢您的使用，如有问题请联系客服。</p>
  `.trim();

  return (
    <PureGlobal>
      <Form data={{ title: '产品发布公告', content: articleContent }}>
        <FormInfo
          title="文章详情（只读模式）"
          column={1}
          list={[
            <Input name="title" label="文章标题" disabled />
          ]}
        />
        <Editor name="content" label="文章内容" readOnly height={400} block />
      </Form>
    </PureGlobal>
  );
});

render(<ReadonlyExample />);
