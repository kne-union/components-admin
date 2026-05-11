### MessageQueue

消息队列管理主组件，内部包含 Dashboard、消息列表、死信列表、轨迹列表和队列工具页。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 组件挂载的基础路由，例如 `/MessageQueue/mq` | string | - |
| pageProps | 传给内部页面组件的布局配置 | object | `{}` |
| children | 自定义顶部导航或附加内容 | ReactNode | - |

### 子组件

| 导出名 | 说明 |
| --- | --- |
| Dashboard | 队列指标概览页 |
| MessageList | 消息列表页，支持发布消息和查看详情 |
| DeadLetterList | 死信列表页，支持单条和批量重放 |
| TraceList | 消息轨迹列表页 |
| QueueTools | 队列深度查询和消息清理工具页 |
| PublishMessage | 发布消息按钮组件 |
| Actions | 消息列表操作按钮 |
| DeadLetterActions | 死信列表操作按钮 |

### Actions

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 消息记录 | object | - |
| onTrace | 点击查看轨迹时触发 | `(data) => void` | - |
| onSuccess | 操作成功后的回调 | `() => void` | - |
| type | 按钮类型 | string | `default` |

### DeadLetterActions

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 死信记录 | object | - |
| onSuccess | 重放成功后的回调 | `() => void` | - |
| type | 按钮类型 | string | `default` |

### PublishMessage

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| onSuccess | 发布成功后的回调 | `() => void` | - |

### 枚举

| 枚举名 | 值 |
| --- | --- |
| messageStatus | `PENDING`、`PROCESSING`、`COMPLETED`、`FAILED` |
| traceEvent | `PUBLISHED`、`PROCESSING`、`COMPLETED`、`FAILED`、`MOVED_TO_DLQ`、`REPLAYED`、`LOCK_RECOVERED` |
| mqBoolean | `true`、`false` |

### fastify-mq 接口

| 功能 | 方法 | 路径 | 参数 |
| --- | --- | --- | --- |
| 发布消息 | POST | `/mq/message/publish` | `topic`、`payload`、`priority`、`executeAt`、`maxRetries`、`traceId`、`meta` |
| 消息列表 | GET | `/mq/message/list` | `topic`、`status`、`traceId`、`perPage`、`currentPage` |
| 死信列表 | GET | `/mq/dlq/list` | `topic`、`replayed`、`perPage`、`currentPage` |
| 重放死信 | POST | `/mq/dlq/replay` | `id` 或 `ids` |
| 轨迹列表 | GET | `/mq/trace/list` | `topic`、`messageId`、`event`、`perPage`、`currentPage` |
| 轨迹详情 | GET | `/mq/trace/detail` | `traceId` |
| Dashboard | GET | `/mq/dashboard` | `window`、`step` |
| 队列深度 | GET | `/mq/queue/depth` | `topic` |
| 清理消息 | POST | `/mq/queue/cleanup` | `status`、`olderThan` |
