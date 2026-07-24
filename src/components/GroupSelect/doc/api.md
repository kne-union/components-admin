## GroupSelect 组件

分组标签选择器组件，基于 SuperSelectTableList 树形模式封装，用于选择和管理技能标签或其他分组数据，支持搜索、添加、编辑和删除。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 字段名（必填） | string | - |
| label | 字段标签 | string \| ReactNode | - |
| rule | 校验规则 | string | - |
| type | 分组类型，透传到 create/save/remove/groupList | string | - |
| language | 语言，默认取全局 locale | string | - |
| apis | API 配置对象，不传则使用 `preset.apis.group` | object | - |
| apis.groupList | 分组树接口（列表展示、父级选择）；`output: 'tree'` | object | - |
| apis.create | 创建接口 | object | - |
| apis.save | 保存/更新接口 | object | - |
| apis.remove | 删除接口 | object | - |
| valueKey | 值字段名 | string | 'code' |
| labelKey | 标签字段名 | string | 'name' |
| single | 是否单选 | boolean | false |
| placeholder | 占位符 | string | - |
| disabled | 是否禁用 | boolean | false |
| groupName | 标签名称，用于显示添加/删除等操作文案 | string | '标签' |
| permissions | 功能权限数组，可选 `'add'` / `'edit'` / `'delete'`；不传则三项全开（仍需有对应 API） | string[] | `['add','edit','delete']` |
| allowCustomCode | 是否允许自定义编码；为 `true` 时表单显示编码并做重复校验；为 `false` 时不传 code，由后端自动生成 | boolean | `true` |

## GroupSelectFilterItem 组件

用 `Filter@withFieldItem` 包装 `GroupSelect.Field`，可直接放进 `Filter.list`。内置 `{code,name} ↔ {label,value}` 拦截器（可用 `interceptor` 覆盖）。

远程加载：`components-admin:GroupSelect@GroupSelectFilterItem` 或 `GroupSelect.FilterItem`

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name / label | Filter 字段名与展示标签 | string | - |
| type | 分组类型，如技能标签 / 问题标签 | string | - |
| single | 是否单选 | boolean | false |
| valueKey / labelKey | 值与展示字段 | string | `'code'` / `'name'` |
| interceptor | 覆盖默认 code/name 拦截器 | object | 内置 |
| overlayWidth | 弹出层宽度（Filter 触发器很窄，需显式设置） | string \| number | `'800px'` |
| 其余 | 透传 `GroupSelect.Field`（apis、permissions、groupName 等） | - | - |

### 基本用法

```jsx
const { FilterItem: GroupSelectFilterItem } = GroupSelect;
// 或 remote: components-admin:GroupSelect@GroupSelectFilterItem

<Filter
  value={filter}
  onChange={setFilter}
  list={[
    [
      <GroupSelectFilterItem label="技能标签" name="groups" type="skill" permissions={[]} />,
      <GroupSelectFilterItem label="问题标签" name="tags" type="question_tag" single permissions={[]} />
    ]
  ]}
/>
```

## GroupFolderFilterItem 组件

分组树筛选（文件夹场景），基于 `SuperSelectTreeField` + Group API，默认单选。远程加载：`components-admin:GroupSelect@GroupFolderFilterItem`

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name / label | Filter 字段名与展示标签 | string | - |
| type | 分组类型 | string | - |
| single | 是否单选 | boolean | true |
| valueKey / labelKey | 值与展示字段 | string | `'code'` / `'name'` |
| apis | 覆盖 `groupList` 等 | object | `preset.apis.group` |
| showColor | 已选与下拉项是否按分组 `color` 显示文件夹图标 | boolean | `false` |
| overlayWidth | 弹出层宽度 | string \| number | `'280px'` |
| interceptor | 覆盖默认拦截器 | object | 内置 |

```jsx
<GroupFolderFilterItem label="文件夹" name="folder" type="skill" single />
```

## GroupFolderToolbar 组件

类似人才库「文件夹工具栏」：树形下拉选择当前分组，默认选中「全部」；选中具体分组后可编辑/删除；右侧圆形按钮新建分组。内部请求 `apis.group.groupList / create|save / remove`。

远程加载：`components-admin:GroupSelect@GroupFolderToolbar`

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 分组类型 | string | - |
| language | 语言 | string | 全局 locale |
| value / onChange | 受控选中值；`onChange(key, item)`，选「全部」时为 `(null, null)` | any / function | - |
| apis | 覆盖 `groupList` / `create` / `save` / `remove` | object | `preset.apis.group` |
| valueKey | 值字段 | string | 'code' |
| labelKey | 展示字段 | string | 'name' |
| groupName | 文案中的实体名 | string | '标签' |
| compact | 更窄的选择框 | boolean | false |
| manageable | `false` 时关闭全部管理能力 | boolean | true |
| permissions | 功能权限数组 `'add'` / `'edit'` / `'delete'`；不传则三项全开（仍需有对应 API） | string[] | `['add','edit','delete']` |
| allowCustomCode | 是否允许自定义编码；文件夹场景默认关闭，由后端自动生成 | boolean | `false` |
| showParent | 新建/编辑表单是否展示「父级」字段；`false` 时为扁平分组 | boolean | true |
| showColor | 新建/编辑表单是否展示「颜色」字段，提交时随 `color` 字段传给 create/save；开启后已选名称前与下拉选项均按分组 `color` 显示实心文件夹图标 | boolean | false |

### 交互说明

1. 默认展示并选中「全部」，不可清空到空值
2. 选中非「全部」时，选择框右侧出现编辑、删除按钮（受 `permissions` 控制）
3. 新建/编辑弹窗字段：编码（可由 `allowCustomCode={false}` 关闭）、名称、父级（可由 `showParent={false}` 关闭）、描述；编辑时编码不可改，可改名称与父级
4. 删除当前选中项后，自动回到「全部」

### 基本用法

```jsx
import { createWithRemoteLoader } from '@kne/remote-loader';

const Example = createWithRemoteLoader({
  modules: ['components-admin:GroupSelect@GroupFolderToolbar']
})(({ remoteModules }) => {
  const [GroupFolderToolbar] = remoteModules;
  const [folder, setFolder] = React.useState(null);

  return (
    <GroupFolderToolbar
      type="skill"
      groupName="分组"
      value={folder}
      onChange={(key) => setFolder(key)}
    />
  );
});
```

## GroupFolder 组件

左侧分组树 + 右侧内容区布局，适用于列表页按分组筛选。远程加载：`components-admin:GroupSelect@GroupFolder`

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 分组类型 | string | - |
| language | 语言 | string | 全局 locale |
| showRoot | 是否显示「全部」根节点 | boolean | true |
| rootTitle | 根节点文案 | string | '全部' |
| value / onChange | 受控；`onChange(key, node)`，根节点为 `(null, null)` | any / function | - |
| apis | 覆盖 `groupList` 等，默认 `preset.apis.group` | object | - |
| children | 右侧内容，或 render props：`({ treeData, selectedKeys, onChange, tree })` | ReactNode \| function | - |

### 基本用法

```jsx
<GroupFolder type="skill" value={key} onChange={setKey}>
  <List filterGroup={key} />
</GroupFolder>
```

## 功能特性（GroupSelect）

### 1. 树形表格展示
- 使用 SelectTableList `dataType="tree"`，数据来自 `apis.groupList`（`output: 'tree'`）
- 支持客户端关键字搜索

### 2. 添加 / 编辑 / 删除
- 默认支持三项；通过 `permissions={['add','edit']}` 等隐藏部分功能
- 编辑可改名称与父级，不可改编码
- 仅当对应 API（create/save/remove）存在时显示

### 3. 自定义编码
- `allowCustomCode={true}`（默认）：表单显示编码，新建时异步校验不可重复
- `allowCustomCode={false}`：表单不显示编码，提交由后端自动生成

### 4. 多选/单选
- 默认支持多选
- 设置 `single={true}` 切换为单选模式

## 默认 API 配置

组件默认使用 `apis.group`：

```javascript
{
  groupList: { /* GET 树/列表，params.output = tree|list */ },
  create: { /* POST 新建，通常与 save 同址 */ },
  save: { /* POST 新建或更新（带 id） */ },
  remove: { /* POST 删除 */ }
}
```

典型请求参数：

- `groupList`：`{ type, language, output: 'tree' | 'list' }`
- `create` / `save`：`{ type, language, code?, name, parentId, description, id? }`（`code` 可省略由后端生成）
- `remove`：`{ id, code, type }`

需要在全局 preset 中配置，或通过 `apis` 属性传入。

## 依赖模块

- `components-core:FormInfo`
- `components-core:FormInfo@useFormModal`
- `components-core:Global@usePreset`
- `components-core:Common@SuperSelectTreeField`（工具栏 / 文件夹筛选）
- `components-core:Filter@withFieldItem`（FilterItem）
