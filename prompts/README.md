# Prompts 文档集合

本项目包含多个 AI prompts 文档，用于指导生成前端组件库相关的代码模块、文档和示例。

---

## 文档集合列表

### 1. BizUnit 使用指南

**功能**: 生成基于 BizUnit 架构模式的完整前端业务模块

**适用场景**:
- 需要生成包含完整 CRUD 功能的前端业务模块
- 需要国际化支持和可复用组件结构
- 生成符合规范的目录结构和文档示例

**核心内容**:
- 模块目录结构规范（List、Detail、FormInner、TabDetail、Actions 等组件）
- 核心组件实现规范（根组件、列表页、表单组件、详情页、Tab 详情页）
- 国际化文件规范（中英文语言包）
- API 集成规范
- 文档示例规范

**所属集合**: `prompts-remote-components/`

---

### 2. RemoteLoader 使用指南

**功能**: 远程模块加载库的使用指南，基于 Webpack 5 Module Federation

**适用场景**:
- 构建微前端架构
- 需要在运行时动态加载远程模块
- 多团队独立开发部署模块的场景

**核心内容**:
- 四种使用方式：RemoteLoader 组件、withRemoteLoader HOC、useLoader Hook、createWithRemoteLoader
- 模块标记格式详解
- API 参考（preset、loadModule、safeLoadModule、parseToken 等）
- 缓存机制
- 错误处理和调试
- 性能优化

**所属集合**: `prompts-remote-components/`

---

### 3. FormInfo 使用指南

**功能**: 基于 React 和 Ant Design 的企业级表单组件库

**适用场景**:
- 构建复杂的表单页面
- 需要表单验证、动态字段、弹窗/抽屉表单
- 分步表单向导

**核心内容**:
- 核心组件：Form、FormInfo、SubmitButton、CancelButton
- 字段类型：Input、TextArea、Select、DatePicker、Upload 等
- 校验规则配置
- 列表组件：List（卡片式）、TableList（表格）
- 弹窗与抽屉：FormModal、FormDrawer
- 分步表单：FormSteps、FormStepModal
- 表单 Hook：useFormModal、useFormDrawer、useFormStepModal
- 国际化支持

**所属集合**: 根目录、`prompts-remote-components/`（内容相同）

---

### 4. 国际化

**功能**: 指导组件完成国际化改造

**适用场景**:
- 需要为组件添加多语言支持
- 创建语言包和国际化上下文
- 修改组件以支持国际化

**核心内容**:
- 国际化文件创建（withLocale.js、locale/zh-CN.js、locale/en-US.js）
- 组件修改模式（主组件、FormInner、getColumns、Action）
- useIntl Hook 和 withLocale HOC 使用方式
- createWithRemoteLoader 组件的国际化包裹规范
- 语言包 key 命名规范
- 检查要点清单

**所属集合**: `prompts-remote-components/`

---

### 5. 生成文档

**功能**: 根据代码实现自动生成项目文档（summary.md 和 api.md）

**适用场景**:
- 需要为组件生成规范化的项目概述文档
- 需要生成 API 属性表格文档
- 组件开发完成后需要补充文档

**核心内容**:
- 项目概述文档（doc/summary.md）格式规范
- API 文档（doc/api.md）格式规范
- 文档生成流程（分析代码结构、提取 API 信息）
- 格式约束（标题级别、表格格式、无示例代码）

**所属集合**: `prompts-remote-components/`

---

### 6. 组件示例编写提示词

**功能**: 指导编写规范的组件示例代码和配置

**适用场景**:
- 为组件编写可运行的示例代码
- 配置 example.json 示例配置文件
- 编写覆盖 API 的完整示例

**核心内容**:
- 文件结构规范（doc/ 目录、子组件示例规则）
- example.json 配置结构
- 示例代码规范（scope 依赖声明、导入方式）
- 示例内容设计原则（API 覆盖率、真实业务场景、数据真实性）
- FormInfo 组件示例特殊规则
- Mock 数据规范和使用方式
- 示例完整性检查清单

**所属集合**: 根目录、`prompts-remote-components/`（内容略有差异）

---

### 7. BizUnit 业务模块生成提示词

**功能**: 快速生成业务模块 action 的代码模板

**适用场景**:
- 需要快速生成业务表单操作按钮
- 创建新建、编辑类业务组件

**核心内容**:
- 组件命名规范（大写字母开头英文名称）
- 代码模板结构
- 成功提示语配置
- 表单弹窗集成

**所属集合**: 根目录

---

## 快速选择指南

| 需求 | 推荐文档 | 所属集合 |
|------|---------|---------|
| 生成完整的业务模块（列表+表单+详情） | BizUnit 使用指南 | prompts-remote-components/ |
| 加载远程组件/微前端 | RemoteLoader 使用指南 | prompts-remote-components/ |
| 构建表单页面（验证、动态字段、弹窗） | FormInfo 使用指南 | 两者都有 |
| 为组件添加多语言支持 | 国际化 | prompts-remote-components/ |
| 为组件生成项目概述和 API 文档 | 生成文档 | prompts-remote-components/ |
| 编写组件示例代码和配置 | 组件示例编写提示词 | 两者都有 |
| 快速生成业务 Action 组件 | BizUnit 业务模块生成提示词 | 根目录 |

---

## 版本信息

```json
{
  "@kne/prompts-remote-components": "1.0.2"
}
```
