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
