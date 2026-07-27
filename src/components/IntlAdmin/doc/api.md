## IntlAdmin 组件

国际化语言包管理组件，提供语言类型和语言库的管理功能。

| 属性名 | 说明 | 类型 | 默认值 |
|  ---  | ---  | --- | --- |
| baseUrl | 基础路由路径 | string | - |
| pageProps | 透传给子页 `page` 的额外属性（如 `menuFixed`） | object | - |

## 子组件

### LangType 子组件

语言类型管理组件，管理支持的语言种类。

| 属性名 | 说明 | 类型 | 默认值 |
|  ---  | ---  | --- | --- |
| menu | 菜单组件 | ReactNode | - |
| pageProps | 透传给 BizUnit `page` | object | - |

**功能说明：**
- 语言类型列表展示（关键字搜索）
- 创建 / 编辑 / 删除语言类型
- 启用 / 禁用语言类型
- 默认语言：首条创建自动为默认；非默认行可「设为默认」

**数据结构：**

```javascript
{
  id: number,           // ID
  name: string,         // 名称（如：中文（简体））
  code: string,         // 编码（如：zh-CN）
  params: string,       // 翻译参数
  description: string,  // 描述
  isDefault: boolean,   // 是否默认语言（全局唯一）
  status: string        // 状态：open-启用，closed-禁用（Enum openStatus）
}
```

### LangLib 子组件

语言库管理组件，管理各语言的翻译文本。接口返回**扁平词条列表**，前端 `transformData` 按 `namespace+code` 组装为 TablePage `dataType: 'treeList'`。

| 属性名 | 说明 | 类型 | 默认值 |
|  ---  | ---  | --- | --- |
| menu | 菜单组件 | ReactNode | - |
| pageProps | 透传给 BizUnit `page` | object | - |

**功能说明：**
- 词条树形展示（按 namespace+code 分组，各 locale 为子节点；树由前端组装）
- 添加 / 编辑 / 删除翻译文本
- 启用 / 禁用语言包
- 待审核词条可进行审核（通过 / 拒绝）
- 多选批量审核 / 批量删除（仅子级词条可选）
- 筛选：关键字、语言、审核状态

**接口 list 数据结构（扁平）：**

```javascript
{
  id: number,
  namespace: string,       // 命名空间（如：components-admin）
  locale: string,          // 语言（如：zh-CN）
  code: string,            // 编码（如：AddUser）
  target: string,          // 目标值（翻译文本）
  reviewStatus: string,    // 审核状态：approved / pending / rejected
  status: string           // 状态：open / closed（Enum openStatus）
}
```

**前端树形约定（`parentKey: parentId`，由 transformData 生成）：**

| 层级 | 字段 | 说明 |
|------|------|------|
| 父级 | `id: g-{namespace}-{code}`、`namespace`、`code`、`parentId: null` | 词条键分组行，无操作按钮 |
| 子级 | 扁平字段 + `parentId` | 具体语言翻译，可编辑/删除/启停/审核 |

**FormInner 字段：** `namespace`（默认 `global`）、`code`、`locale`（选项来自语言类型列表）、`target`；开启 AI 时显示 `sourceTarget`（标注当前默认语言，若该 namespace+code 已有默认语言词条则预填可改）

**审核默认：** 人工填写创建为 `approved`；AI 生成为 `pending`（默认语言源文案写入时为 `approved`）；编辑 target 后重置为 `pending`。

## BizUnit 配置

### LangType

- **apis**: list, create, save, remove, setStatus
- **options.bizName**: 语言种类
- **状态列**: `moduleName: 'openStatus'`（components-core:Enum 内置）

### LangLib

- **apis**: list, create, save, remove, setStatus, review（支持单条 `id` 或批量 `ids`）
- **options.bizName**: 语言词条
- **tableProps**: `dataType: 'treeList'`、`parentKey: 'parentId'`、接口按词条行分页（前端转树）、`rowSelection`、`batchActions`
- **行操作**: `reviewStatus === 'pending'` 时显示「审核」
- **多选**: 仅子级词条可选；批量审核只处理待审核项
- **状态列**: `moduleName: 'openStatus'`（components-core:Enum 内置）
- **审核列**: `moduleName: 'reviewStatus'`（本组件 enums）

## 依赖组件

- `@components/BizUnit`
- `@kne/app-children-router`
- `components-core:Menu` / `Filter` / `FormInfo` / `Enum`
- `components-core:Global@usePreset`

## 路由结构

```
/IntlAdmin           -> LangType（语言类型）
/IntlAdmin/lang-lib  -> LangLib（语言库 / 树形词条）
```
