## GroupSelect 组件

分组标签选择器组件，基于 SuperSelectTableList 封装，用于选择和管理技能标签或其他分组数据，支持搜索、分页、添加和删除功能。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 字段名（必填） | string | - |
| label | 字段标签 | string \| ReactNode | - |
| rule | 校验规则 | string | - |
| apis | API 配置对象 | object | - |
| apis.list | 列表查询接口配置（必填） | object | - |
| apis.create | 创建标签接口配置（传入则显示添加按钮） | object | - |
| apis.remove | 删除标签接口配置（传入则显示删除按钮） | object | - |
| valueKey | 值字段名 | string | 'code' |
| labelKey | 标签字段名 | string | 'name' |
| single | 是否单选 | boolean | false |
| placeholder | 占位符 | string | - |
| disabled | 是否禁用 | boolean | false |
| groupName | 标签名称，用于显示添加/删除等操作文案 | string | '标签' |

## 功能特性

### 1. 表格列表展示
- 以表格形式展示标签列表，包含编码、名称、描述等信息
- 支持分页显示

### 2. 搜索功能
- 支持关键字搜索标签
- 实时过滤搜索结果

### 3. 添加标签
- 点击底部"添加标签"按钮可添加新标签
- 弹出表单填写编码、名称、描述信息
- 仅当传入 `apis.create` 或全局配置 `preset.apis.group.create` 时显示

### 4. 删除标签
- 每行显示删除操作按钮
- 删除前需确认
- 如果标签已被选中，会自动从已选列表中移除
- 仅当传入 `apis.remove` 或全局配置 `preset.apis.group.remove` 时显示

### 5. 多选/单选
- 默认支持多选
- 设置 `single={true}` 切换为单选模式

## 使用说明

### 基本用法

```jsx
import { createWithRemoteLoader } from '@kne/remote-loader';
import GroupSelect from '@components/GroupSelect';

const FormExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton } = FormInfo;

  return (
    <Form onSubmit={(data) => console.log(data)}>
      <GroupSelect
        name="groups"
        label="技能标签"
        rule="REQ"
      />
      <SubmitButton>提交</SubmitButton>
    </Form>
  );
});
```

### 自定义标签名称

```jsx
<GroupSelect
  name="groups"
  label="技能标签"
  groupName="技能标签"
/>
```

### 自定义 API

```jsx
<GroupSelect
  name="groups"
  label="技能标签"
  apis={{
    list: { url: '/api/groups', method: 'GET' },
    create: { url: '/api/groups', method: 'POST' },
    remove: { url: '/api/groups/remove', method: 'POST' }
  }}
/>
```

### 单选模式

```jsx
<GroupSelect
  name="primaryGroup"
  label="主技能标签"
  single
/>
```

### 只读模式（不显示添加/删除按钮）

当只传入 `apis.list` 而不传入 `create` 和 `remove` 时，组件将只提供选择功能，不显示添加和删除按钮：

```jsx
<GroupSelect
  name="groups"
  label="技能标签"
  apis={{
    list: { url: '/api/groups', method: 'GET' }
    // 不传 create，隐藏添加按钮
    // 不传 remove，隐藏删除按钮
  }}
/>
```

## 依赖模块

- `components-core:FormInfo` - 表单组件
- `components-core:FormInfo@useFormModal` - 表单弹窗
- `components-core:Global@usePreset` - 全局配置（用于获取默认 API）

## 默认 API 配置

组件默认使用 `apis.group` 中的接口配置：

```javascript
{
  list: { /* 列表查询接口 */ },
  create: { /* 创建标签接口 */ },
  remove: { /* 删除标签接口 */ }
}
```

需要在全局 preset 中配置相应的 API，或通过 `apis` 属性传入。
