# Editor

### 概述

富文本编辑器字段组件，基于 CKEditor 封装，作为 FormInfo 的字段组件使用，支持文本格式化、图片上传、表格插入等富文本编辑功能。


### 示例

#### 示例代码

- 基础用法
- 展示 Editor 组件的基本使用方式，包含必填校验和高度设置
- _Editor(@components/Editor),remoteLoader(@kne/remote-loader)

```jsx
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

```

- 表单字段使用
- 在表单中配合其他字段组件使用 Editor，展示完整的文章编辑表单场景
- _Editor(@components/Editor),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
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

```

- 只读模式
- 展示 Editor 的只读模式，通常用于内容预览或详情展示
- _Editor(@components/Editor),remoteLoader(@kne/remote-loader)

```jsx
const { default: Editor } = _Editor;
const { createWithRemoteLoader } = remoteLoader;

const ReadonlyExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, fields } = FormInfo;
  const { Input } = fields;

  const articleContent = &#96;
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
  &#96;.trim();

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

```

- 表单校验
- 展示 Editor 在表单中的校验功能，支持必填和长度校验
- _Editor(@components/Editor),remoteLoader(@kne/remote-loader)

```jsx
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

```

### API

## Editor 组件

富文本编辑器字段组件，基于 CKEditor 封装，作为 FormInfo 的表单字段组件使用，支持富文本编辑、图片上传等功能。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 字段名（必填） | string | - |
| label | 字段标签 | string \| ReactNode | - |
| rule | 校验规则，如 "REQ" 表示必填 | string | - |
| placeholder | 占位符文本 | string | - |
| disabled | 是否禁用 | boolean | false |
| readOnly | 是否只读 | boolean | false |
| value | 编辑器内容（受控） | string | - |
| defaultValue | 默认内容（非受控） | string | - |
| onChange | 内容变化回调 | function(value) | - |
| height | 编辑器高度 | number \| string | - |
| maxLength | 最大字符长度 | number | - |
| tips | 提示信息 | string \| ReactNode | - |
| block | 是否占满整行 | boolean | false |
| labelHidden | 是否隐藏标签 | boolean | false |
| display | 条件显示函数 | function({ formData }) => boolean | - |

## 使用说明

### 作为表单字段使用

Editor 组件必须在 FormInfo 的 Form 组件中使用，作为独立的字段组件导入：

```jsx
import { createWithRemoteLoader } from '@kne/remote-loader';
import Editor from '@components/Editor';

const FormExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton } = FormInfo;

  return (
    <Form onSubmit={(data) => console.log(data)}>
      <Editor 
        name="content" 
        label="内容" 
        rule="REQ" 
        placeholder="请输入内容"
      />
      <SubmitButton>提交</SubmitButton>
    </Form>
  );
});
```

### 图片上传功能

Editor 组件内置图片上传功能，通过 `apis.file.uploadForEditor` 配置上传接口。需要在全局 preset 中配置相应的 API。

### 富文本功能

支持常见的富文本编辑功能：
- 文本格式化（加粗、斜体、下划线、删除线）
- 段落格式（标题、引用、代码块）
- 列表（有序列表、无序列表）
- 对齐方式
- 链接插入
- 图片插入（需要配置上传接口）
- 表格插入
- 撤销/重做

## 依赖模块

- `components-thirdparty:CKEditor` - CKEditor 编辑器核心
- `components-core:Global@usePreset` - 全局配置（用于获取上传接口）
