### BizUnit

高度封装的 CRUD 业务单元组件，内置列表、关键字搜索、筛选、创建、编辑、删除、状态切换等能力。通过配置 `apis`、`getColumns`、
`getFormInner` 即可快速落地标准列表页，操作列由组件自动追加。

#### 模式说明

|       | isNext（新建模块必用）                         | Legacy（已废弃）        |
|-------|----------------------------------------|--------------------|
| 启用    | `isNext`                               | 默认，不传 `isNext`     |
| 表格    | `Layout.TablePage` + `@kne/table-page` | `Table.TablePage`  |
| 外层要求  | **须在 `Layout` 内**                      | 无                  |
| 列配置   | `renderType`、`getValueOf`              | `type`、`valueOf`   |
| 筛选    | `filter`（`{ list }` 一维数组）       | `filter`（二维数组） |
| 页面标题  | `page.title`                           | 自行布局               |
| 关键字搜索 | TablePage 内置 `search`                  | 顶部 `SearchInput`   |

#### 属性

| 属性名                | 说明                                      | 类型              | 默认值   |
|--------------------|-----------------------------------------|-----------------|-------|
| isNext             | 启用新版表格与 API                             | Boolean         | false |
| apis               | API 配置对象                                | Object          | {}    |
| getColumns         | 列配置函数，返回列数组（不含操作列）                      | Function        | -     |
| getFormInner       | 表单内容函数，返回表单 JSX                         | Function        | -     |
| getActionList      | 操作列表函数，自定义行内按钮                          | Function        | -     |
| name               | 表格名称（缓存等）                               | String          | -     |
| page               | isNext 模式页面配置，如 `{ title }`             | Object          | -     |
| options            | 全局配置选项                                  | Object          | {}    |
| filter             | 筛选配置；isNext 为 `{ list }` 对象，Legacy 为二维数组 | Array \| Object | -     |
| allowKeywordSearch | 是否显示关键字搜索                               | Boolean         | true  |
| topOptionsSize     | Legacy 模式顶部搜索框尺寸                        | String          | -     |
| titleExtra         | 标题区域额外内容（创建按钮旁）                         | ReactNode       | null  |
| children           | 自定义渲染函数，接管布局                            | Function        | -     |
| onMount            | 组件挂载回调                                  | Function        | -     |
| onFilterChange     | 筛选变更回调                                  | Function        | -     |
| urlFilterValue     | URL 筛选参数映射，见 `Filter.useUrlFilterValue` | Array \| Object | -     |

#### apis

| 属性名       | 说明     | 类型                |
|-----------|--------|-------------------|
| list      | 列表接口   | Object / Function |
| create    | 创建接口   | Object / Function |
| save      | 编辑保存接口 | Object / Function |
| remove    | 删除接口   | Object / Function |
| setStatus | 状态切换接口 | Object / Function |

`create` / `save` / `remove` 支持函数形式，用于组装请求体：

```javascript
save: ({ formData, data }) =>
  Object.assign({}, apis.myEntity.save, { data: { ...formData, id: data.id } })
```

**isNext 列表数据格式**：接口返回 `{ pageData: [...], totalCount: number }`（`total` 亦可）。组件通过 `dataFormat` 转为
TablePage 所需的 `{ list, total }`。

#### options

| 属性名                  | 说明                                                           | 类型                | 默认值                                        |
|----------------------|--------------------------------------------------------------|-------------------|--------------------------------------------|
| bizName              | 业务名称（弹窗标题、确认文案）                                              | String            | ''                                         |
| createButtonProps    | 创建按钮属性                                                       | Object            | `{ children: '添加', type: 'primary' }`      |
| editButtonProps      | 编辑按钮                                                         | Object            | `{ children: '编辑' }`                       |
| removeButtonProps    | 删除按钮                                                         | Object            | `{ children: '删除' }`                       |
| openButtonProps      | 开启按钮                                                         | Object            | `{ children: '开启' }`                       |
| closeButtonProps     | 关闭按钮                                                         | Object            | `{ children: '关闭' }`                       |
| tableProps           | 表格属性；isNext 下可传 `rowSelection`、`batchActions`、`pagination` 等 | Object            | `{ pagination: { paramsType: 'params' } }` |
| keywordFilterName    | 关键字搜索字段名                                                     | String            | 'keyword'                                  |
| keywordFilterLabel   | 关键字搜索标签                                                      | String            | '关键字'                                      |
| formSize             | 表单弹窗尺寸                                                       | String            | 'small'                                    |
| formProps            | 表单属性                                                         | Object / Function | -                                          |
| formModalProps       | 表单弹窗属性                                                       | Object            | -                                          |
| createFormModalProps | 创建弹窗属性                                                       | Object            | -                                          |
| editFormModalProps   | 编辑弹窗属性                                                       | Object            | -                                          |
| openStatus           | 开启状态值                                                        | String            | 'open'                                     |
| closedStatus         | 关闭状态值                                                        | String            | 'closed'                                   |
| removeMessage        | 删除确认提示                                                       | String            | -                                          |
| closeMessage         | 关闭确认提示                                                       | String            | -                                          |
| saveData             | 编辑时数据处理                                                      | Function          | -                                          |
| getFilterValue       | Legacy 筛选值转换                                                 | Function          | -                                          |
| mapFilterValue       | 筛选值映射（isNext `filter` 可用）                               | Function          | -                                          |

#### filter（isNext）

传给 TablePage 内置筛选，结构为 `{ list }`，`list` 为**一维数组**，每项 `{ type, props }`：

```javascript
filter = {
  list: [
    {
      type: SuperSelectFilterItem,  // 来自 Filter.fields
      props: { name: 'status', label: '状态', single: true, options: [...] }
    }
  ]
}
```

- 勿使用 legacy 的二维数组，勿传 `displayLine`
- 筛选项组件从 `Filter.fields` 解构（`InputFilterItem`、`SuperSelectFilterItem`、`DateRangeFilterItem` 等）

#### getColumns

返回列配置数组，**不含操作列**（操作列由组件自动追加）。

##### isNext 列配置（推荐）

遵循 `@kne/table-page`：

| 配置         | 说明                                                      |
|------------|---------------------------------------------------------|
| name       | 字段名                                                     |
| title      | 列标题                                                     |
| width      | 列宽                                                      |
| renderType | `main`、`small`、`tag`、`status`、`description`、`options` 等 |
| getValueOf | 取值函数；tag/status 返回 `{ type, text }`                     |
| format     | `date`、`datetime`                                       |
| ellipsis   | 超出省略                                                    |
| fixed      | 固定列，如 `'right'`                                         |

枚举列可加载 `Enum` 组件，在 `getValueOf` 中通过 `valueOf` 渲染。

##### Legacy 列配置（已废弃）

| type         | 说明                               |
|--------------|----------------------------------|
| serialNumber | 序号                               |
| mainInfo     | 主信息                              |
| tag          | 标签，`valueOf` 返回 `{ type, text }` |
| description  | 描述                               |
| datetime     | 日期时间                             |
| avatar       | 头像                               |

#### getFormInner

| 参数      | 说明     | 类型                     |
|---------|--------|------------------------|
| action  | 操作类型   | `'create'` \| `'edit'` |
| apis    | API 配置 | Object                 |
| options | 配置选项   | Object                 |

使用 `FormInfo` 及 `FormInfo.fields` 定义字段。

#### getActionList

返回操作按钮配置数组，支持以下形式：

| 形式                                            | 说明                                       |
|-----------------------------------------------|------------------------------------------|
| `{ name, reset }`                             | 重置内置按钮；`reset` 接收原配置返回新配置（可设 `hidden` 等） |
| `{ name }`                                    | 引用内置按钮名                                  |
| `{ buttonComponent, children, hidden, data }` | 自定义按钮组件                                  |

**内置按钮名**：`remove`、`save`、`setStatusOpen`、`setStatusClose`

独立按钮组件内通过 `usePreset()` 获取 `ajax` 与 `apis`，成功后调用 `onSuccess` 刷新列表。

#### children

函数子节点，用于自定义列表外层布局。推荐配合 `@kne/system-layout`（无需 `components-core` 的 Layout / Page）：

1. 模块入口使用 `@kne/app-children-router` 的 `AppChildrenRouter` 管理子路由；示例环境外层用 `Layout` / `SystemLayout` 包裹
   `Routes`，`AppChildrenRouter` 不设 `element`（若使用 `element` 布局壳，须在壳内渲染 `<Outlet />`）
2. `SystemLayout` 提供侧栏菜单，包裹 `Routes` 与 `AppChildrenRouter`
3. `BizUnit` 开启 `isNext`，通过 `children` 回调渲染
4. `@kne/system-layout` 的 `Page` 承载 `title` / `extra`（对应 `titleExtra`）
5. `TablePageRender` 渲染新版 `components-core:TablePage`（`isNext` 时自动跳过 `Layout@TablePage` 外壳）

须引入 `@kne/system-layout/dist/index.css`。无需 `children` 时，`BizUnit isNext` 默认渲染 `Layout@TablePage`，配合
`AppChildrenRouter` + `page.menu` 实现多列表页。带状态 Tab 的列表页可配合 `StateBarPage`（`components-core`）。

回调参数：

| 参数           | isNext             | Legacy                      |
|--------------|--------------------|-----------------------------|
| isNext       | boolean            | boolean                     |
| filter       | `filter` 配置对象 | `{ value, onChange, list }` |
| topOptions   | 工具栏（含创建按钮）         | 顶部区域                        |
| titleExtra   | 同 topOptions       | FilterProvider 包裹的顶部        |
| tableOptions | 传给 TablePage 的完整配置 | 同上                          |

### Actions

行内操作按钮区域，通常由 BizUnit 内部使用，也可单独引用。

| 属性名           | 说明            | 类型       | 默认值    |
|---------------|---------------|----------|--------|
| moreType      | 更多按钮类型        | String   | 'link' |
| itemClassName | 按钮项 className | String   | -      |
| getActionList | 操作列表函数        | Function | -      |
| getFormInner  | 表单内容函数        | Function | -      |
| data          | 当前行数据         | Object   | -      |
| apis          | API 配置        | Object   | -      |
| options       | 配置选项          | Object   | -      |
| onSuccess     | 操作成功回调        | Function | -      |
| children      | 自定义渲染         | Function | -      |

### TablePageRender

表格页面渲染组件，配合 `children` 自定义布局。

| 属性名          | 说明                                   | 类型        |
|--------------|--------------------------------------|-----------|
| filter       | 筛选配置                                 | Object    |
| titleExtra   | 标题额外内容                               | ReactNode |
| tableOptions | 表格配置（来自 `children` 回调）               | Object    |
| page         | 页面配置（legacy 模式传给 `Layout@TablePage`） | Object    |

**渲染逻辑**：

- `tableOptions.isNext === true`：渲染新版 `components-core:TablePage`，供 `@kne/system-layout` 的 `Page` 等外层容器使用
- 否则：渲染 `components-core:Layout@TablePage`（含权限页与旧版表格）

---

带筛选时传入 `filter`；批量操作通过 `options.tableProps` 传入 `rowSelection`、`batchActions`（需配合
`Table.useSelectedRow`）。
