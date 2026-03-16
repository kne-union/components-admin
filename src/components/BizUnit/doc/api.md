# BizUnit API 文档

## BizUnit 主组件

高度封装的 CRUD 业务单元组件，内置列表、搜索、筛选、创建、编辑、删除、状态切换等功能。

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API配置对象 | Object | {} |
| getColumns | 列配置函数，返回列数组 | Function | - |
| getFormInner | 表单内容函数，返回表单JSX | Function | - |
| getActionList | 操作列表函数，用于自定义操作按钮 | Function | - |
| name | 表格名称（用于缓存等） | String | - |
| options | 配置选项 | Object | {} |
| filterList | 筛选列表配置 | Array | [] |
| allowKeywordSearch | 是否允许关键字搜索 | Boolean | true |
| topOptionsSize | 顶部操作按钮尺寸 | String | - |
| titleExtra | 标题额外内容 | ReactNode | null |
| children | 自定义渲染函数 | Function | - |
| onMount | 组件挂载回调 | Function | - |

### apis 配置

| 属性名 | 说明 | 类型 |
| --- | --- | --- |
| list | 列表接口配置 | Object/Function |
| create | 创建接口配置 | Object/Function |
| save | 编辑保存接口配置 | Object/Function |
| remove | 删除接口配置 | Object/Function |
| setStatus | 状态切换接口配置 | Object/Function |

### options 配置

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bizName | 业务名称（用于国际化提示） | String | '' |
| createButtonProps | 创建按钮属性 | Object | { children: '添加', type: 'primary' } |
| editButtonProps | 编辑按钮属性 | Object | { children: '编辑' } |
| removeButtonProps | 删除按钮属性 | Object | { children: '删除' } |
| openButtonProps | 开启按钮属性 | Object | { children: '开启' } |
| closeButtonProps | 关闭按钮属性 | Object | { children: '关闭' } |
| tableProps | 表格属性 | Object | { pagination: { paramsType: 'params' } } |
| keywordFilterName | 关键字筛选字段名 | String | 'keyword' |
| keywordFilterLabel | 关键字筛选标签 | String | '关键字' |
| formSize | 表单弹窗尺寸 | String | 'small' |
| formProps | 表单属性 | Object/Function | - |
| formModalProps | 表单弹窗属性 | Object | - |
| createFormModalProps | 创建表单弹窗属性 | Object | - |
| editFormModalProps | 编辑表单弹窗属性 | Object | - |
| openStatus | 开启状态值 | String | 'open' |
| closedStatus | 关闭状态值 | String | 'closed' |
| removeMessage | 删除确认提示信息 | String | - |
| closeMessage | 关闭确认提示信息 | String | - |
| saveData | 编辑时数据处理函数 | Function | - |
| getFilterValue | 筛选值转换函数 | Function | - |

### getColumns 函数

返回列配置数组，常用列类型：

| 类型 | 说明 | 特殊配置 |
| --- | --- | --- |
| serialNumber | 序号列 | primary, hover |
| mainInfo | 主信息列 | primary, hover |
| tag | 标签列 | valueOf 返回 { type, text } |
| description | 描述列 | ellipsis |
| avatar | 头像列 | valueOf 返回 { id } |
| datetime | 日期时间列 | format |
| other | 其他普通列 | - |

### getFormInner 函数

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| action | 操作类型 | 'create' \| 'edit' |
| apis | API配置对象 | Object |
| options | 配置选项 | Object |

### getActionList 函数

返回操作按钮数组，支持以下格式：

```javascript
// 使用内置按钮
{ name: 'remove', reset: (config) => ({ ...config, hidden: true }) }

// 自定义按钮
{ buttonComponent: CustomComponent, children: '按钮文字', hidden: false }
```

**内置按钮名称：**
- `remove` - 删除按钮
- `save` - 编辑按钮
- `setStatusOpen` - 开启按钮
- `setStatusClose` - 关闭按钮

---

## Actions 子组件

操作按钮组件，用于自定义表格操作列。

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| moreType | 更多按钮类型 | String | 'link' |
| itemClassName | 按钮项样式类名 | String | - |
| getActionList | 操作列表函数 | Function | - |
| getFormInner | 表单内容函数 | Function | - |
| data | 当前行数据 | Object | - |
| apis | API配置对象 | Object | - |
| options | 配置选项 | Object | - |
| onSuccess | 操作成功回调 | Function | - |
| children | 自定义渲染函数 | Function | - |

---

## TablePageRender 子组件

表格页面渲染组件，用于页面级别的表格展示。

### 属性

| 属性名 | 说明 | 类型 |
| --- | --- | --- |
| filter | 筛选配置 | Object |
| titleExtra | 标题额外内容 | ReactNode |
| tableOptions | 表格配置 | Object |
