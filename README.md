# components-admin

用于实现一个后台管理系统的必要组件

[更多文档](https://www.kne-union.top/#/components)

开始：

```shell
npm run start
```

<!--START_SECTION:DOC_MD-->

| 组件 | 简介 |
|------|------|
| [Account](docs/Account.md) | Account 组件提供了完整的用户账号管理功能，包括登录、注册、修改密码、忘记密码、重置密码等功能。支持邮箱和手机号两种账号类型，提供了统一的 UI 风格和交互体验。 |
| [Admin](docs/Admin.md) | 管理后台组件，提供用户管理和系统初始化功能。包含用户列表、添加用户、编辑用户、修改密码、设置超级管理员等完整的管理功能。 |
| [Authenticate](docs/Authenticate.md) | 用户权限和用户信息管理组件，提供用户信息获取、登录后布局、用户信息编辑等功能。支持普通用户、管理员和自定义用户场景。 |
| [BizUnit](docs/BizUnit.md) | 高度封装的 CRUD 业务单元组件，内置列表展示、关键字搜索、筛选、创建、编辑、删除、状态切换等完整能力。通过配置 `apis`、`getColumns`、`getFormInner`… |
| [Editor](docs/Editor.md) | 富文本编辑器字段组件，基于 CKEditor 封装，作为 FormInfo 的字段组件使用，支持文本格式化、图片上传、表格插入等富文本编辑功能。 |
| [GroupSelect](docs/GroupSelect.md) | 分组标签选择器，以及分组工具栏、侧栏布局与 Filter 筛选项（标签 / 文件夹），基于 Group API。 |
| [IntlAdmin](docs/IntlAdmin.md) | 国际化语言包管理：语言类型 CRUD；语言库 treeList 词条（namespace+code 分组），支持增删改查与筛选。 |
| [Language](docs/Language.md) | 切换系统语言 |
| [LoginIllustration](docs/LoginIllustration.md) | 用来实现精美的登录插图，含 Lottie 动画与随 locale 切换的 workforce 人才能力主题插图。 |
| [MessageManger](docs/MessageManger.md) | `MessageManger` 是基于 `fastify-message`… |
| [MessageQueue](docs/MessageQueue.md) | MessageQueue 是面向 `fastify-mq` 的消息队列管理端组件，提供队列运行概览、消息发布与查询、死信处理、轨迹追踪和队列维护工具。 组件直接对齐 `fastify-mq`… |
| [Signature](docs/Signature.md) | 签名密钥管理组件，提供签名密钥的创建、验证、启用/禁用和删除功能，支持密钥列表展示和用户关联管理。 |
| [Task](docs/Task.md) | 任务管理组件，用于展示和管理系统中的异步任务。支持查看我的任务和全部任务，提供任务筛选、排序、批量操作等功能。包含任务取消、重试、查看错误详情和结果详情等操作。 |
| [Tenant](docs/Tenant.md) | 租户管理系统组件，提供公司信息管理、组织架构管理、用户管理、角色权限管理等完整的租户管理功能。子组件 `TenantUserSelect` 支持按组织树筛选并选择租户成员；默认双栏面板，另提供… |
| [TenantAdmin](docs/TenantAdmin.md) | 租户管理 |
| [UserSelect](docs/UserSelect.md) | 用户选择组件，用于在表单中选择用户。支持单选和多选模式，支持按用户状态筛选，支持搜索用户。基于 SuperSelectUser 封装，自动处理用户数据的转换和加载。 |
| [UserTool](docs/UserTool.md) | 用户工具组件，显示用户头像和名称，点击展开下拉菜单，包含用户信息、自定义操作列表和退出登录功能。适用于系统顶部导航栏的用户区域。同时提供 RightOptions 组合组件，包含语言切换和用户工具。 |

<!--END_SECTION:DOC_MD-->
