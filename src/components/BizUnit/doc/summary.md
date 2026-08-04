高度封装的 CRUD 业务单元组件，内置列表展示、关键字搜索、筛选、创建、编辑、删除、状态切换等完整能力。通过配置 `apis`、`getColumns`、`getFormInner` 即可快速落地标准列表页，无需重复编写表格、弹窗与请求逻辑。新业务模块须使用 `isNext` 模式。

### 核心特性

- **配置驱动**：仅凭 `apis`、`getColumns`、`getFormInner` 三项核心配置即可生成完整 CRUD 列表页，操作列由组件自动追加
- **isNext 新版表格**：基于 `@kne/table-page`，支持 `renderType`、`getValueOf`、`format` 等现代化列配置，内置关键字搜索与分页
- **灵活筛选**：`filter` 配置筛选项，isNext 为一维数组，支持输入框、下拉、日期区间等，可配合 `searchParamsValue` 从 URL 平铺参数种子化初始筛选
- **自定义布局**：通过 `children` 回调接管渲染，配合 `TablePageRender` 适配 `SystemLayout`、`StateBarPage` 等多种容器
- **可扩展操作**：`getActionList` 支持重置内置按钮、追加自定义按钮，行内操作灵活可控

### 适用场景

- 标准业务列表页：角色、员工、产品、订单等增删改查管理
- 多页面模块：配合 `AppChildrenRouter` 实现左侧菜单 + 多子路由列表
- 带状态分组：配合 `StateBarPage` 按状态分 Tab 展示
- 系统管理后台：配合 `SystemLayout` + `Page` 构建管理界面
- 需要批量操作、URL 筛选同步、只读列表等定制化场景

### 技术亮点

- 基于 `createWithRemoteLoader` 远程加载 `components-core` 表格、筛选、表单等模块，组件本体保持轻量
- 内置国际化（`withLocale`），默认中英文，支持 `formatMessage` 定制列标题与文案
- 自动数据格式转换：`isNext` 模式将 `{ pageData, totalCount }` 转为 TablePage 所需结构
- 操作列智能构建：`buildOptionsColumn` 根据可用 API 自动生成编辑、删除、状态切换按钮
- 导出 `TablePageRender`、`Actions` 子组件，可脱离 BizUnit 独立使用
