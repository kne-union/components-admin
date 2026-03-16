## IntlAdmin 组件

国际化语言包管理组件，提供语言类型和语言库的管理功能。

| 属性名 | 说明 | 类型 | 默认值 |
|  ---  | ---  | --- | --- |
| baseUrl | 基础路由路径 | string | - |

## 子组件

### LangType 子组件

语言类型管理组件，管理支持的语言种类。

| 属性名 | 说明 | 类型 | 默认值 |
|  ---  | ---  | --- | --- |
| menu | 菜单组件 | ReactNode | - |

**功能说明：**
- 语言类型列表展示
- 创建新的语言类型
- 编辑语言类型信息
- 删除语言类型
- 启用/禁用语言类型

**数据结构：**

```javascript
{
  id: number,           // ID
  name: string,         // 名称（如：中文（简体））
  code: string,         // 编码（如：zh-CN）
  params: string,       // 翻译参数
  description: string,  // 描述
  status: string        // 状态：open-启用，closed-禁用
}
```

### LangLib 子组件

语言库管理组件，管理各语言的翻译文本。

| 属性名 | 说明 | 类型 | 默认值 |
|  ---  | ---  | --- | --- |
| menu | 菜单组件 | ReactNode | - |

**功能说明：**
- 语言库列表展示
- 添加语言包
- 编辑翻译文本
- 启用/禁用语言包

**数据结构：**

```javascript
{
  id: number,              // ID
  namespace: string,       // 命名空间（如：components-admin:User）
  locale: string,          // 语言（如：zh-CN）
  code: string,            // 编码（如：AddUser）
  target: string,          // 目标值（翻译文本）
  reviewStatus: string,    // 审核状态：approved-已通过，pending-待审核，rejected-已拒绝
  status: string           // 状态：open-启用，closed-禁用
}
```

## BizUnit 配置

LangType 和 LangLib 子组件都基于 BizUnit 实现，具有以下标准功能：

### LangType 配置

- **apis**: list, create, save, remove, setStatus
- **options.bizName**: '语言种类'
- **列配置**: ID、名称、编码、翻译参数、描述、状态

### LangLib 配置

- **apis**: list, create, save, setStatus
- **列配置**: ID、命名空间、语言、编码、目标值、审核状态、状态

## 依赖组件

IntlAdmin 组件依赖以下模块：
- `@components/BizUnit` - 业务单元组件
- `components-core:Menu` - 菜单组件
- `components-core:Global@usePreset` - 全局配置
- `components-core:Layout@TablePage` - 表格页面组件
- `components-core:FormInfo` - 表单组件

## 路由结构

```
/IntlAdmin           -> LangType 组件（语言类型管理）
/IntlAdmin/lang-lib  -> LangLib 组件（语言库管理）
```
