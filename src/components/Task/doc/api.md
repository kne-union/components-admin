## Task 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|baseUrl|基础路由路径，用于菜单导航|string|-|
|getManualTaskAction|手动任务的自定义操作按钮渲染函数，接收任务数据返回按钮组件|(data) => ReactNode|-|

## MyTask 子组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|baseUrl|基础路由路径，用于菜单导航|string|-|
|getManualTaskAction|手动任务的自定义操作按钮渲染函数|(data) => ReactNode|-|

## AllTask 子组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|baseUrl|基础路由路径，用于菜单导航|string|-|
|getManualTaskAction|手动任务的自定义操作按钮渲染函数|(data) => ReactNode|-|

## Actions 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|data|任务数据对象|object|-|
|getManualTaskAction|手动任务的自定义操作按钮渲染函数|(data) => ReactNode|-|
|onSuccess|操作成功后的回调函数|() => void|-|
|type|按钮类型|'default' \| 'primary' \| 'link'|'default'|
|moreType|更多按钮的类型|'default' \| 'primary' \| 'link'|'link'|
|itemClassName|按钮项的自定义类名|string|-|
|children|自定义渲染函数，接收操作列表|({ list }) => ReactNode|-|

## CancelTask 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|data|任务数据对象|object|-|
|onSuccess|取消成功后的回调函数|() => void|-|

## RetryTask 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|data|单个任务数据对象（单个重试时使用）|object|-|
|taskIds|任务ID数组（批量重试时使用）|number[]|-|
|onSuccess|重试成功后的回调函数|() => void|-|

## ErrorDetail 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|data|任务数据对象，包含input和error字段|object|-|

## ResultDetail 组件

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|data|任务数据对象，包含input和output字段|object|-|

## getColumns 函数

|参数名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|formatMessage|国际化格式化函数|(descriptor) => string|-|

返回值：TablePage 的 columns 配置数组

## enums 枚举

### taskStatus

任务状态枚举，包含以下值：
- pending: 等待执行
- running: 执行中
- waiting: 等待操作
- success: 成功
- failed: 失败
- canceled: 取消

---

## 任务统计 HTTP

**路径**：`GET /api/v1/task/statistics`（与 `apis.task.statistics.getOverview` 对应）

**Query**

| 参数 | 说明 |
| --- | --- |
| `range` | 历史区间：`7d` \| `1m` \| `3m` \| `1y` |
| `timezone` | 浏览器 IANA 时区（如 `Asia/Shanghai`），与后端按日历日聚合的划界一致 |

**响应**（节选，以实际后端为准）

| 字段 | 说明 |
| --- | --- |
| `recentTrend` / `recentTrendByType` / `recentTrendByStatus` | 历史趋势 |
| `durationTrend` | 耗时趋势 |
| `hourlyCompletionTrend` | 历史「每小时趋势」：`date`、`hour`、`type`、`totalCompleted` 及按状态拆分字段等 |
| `byStatus` / `byType` / `byRunnerType` | 聚合计数 |

---

## 任务实时统计 SSE

**路径**：`GET /api/v1/task/statistics/sse`（与 `apis.task.statistics.sse` 对应）

**客户端**：使用 `EventSource` 拉流；前端会在 URL 上追加 query（见 `useRealtimeStatisticsSSE`）：

| 参数 | 说明 |
| --- | --- |
| `interval` | 推送间隔（秒），如 `5` |
| `token` | 鉴权，如 `X-User-Token` |
| `timezone` | IANA 时区，与「今日」、当日完成数划界一致 |

**每条事件的 `data`**

为 JSON 字符串，解析后为对象（或 `{ "data": { ... } }`，前端会解包）。对象内为**增量或全量**字段均可；前端对 SSE 负载做浅合并。

### 看板「手动执行任务」指标（须与实现对齐）

前端见 `Dashboard/RealtimeSection.js`：「等待操作」用 `pickNonNegativeInt` 读取 `waiting` 相关字段；「当日完成」**仅**读取 **`completedToday.manual`**。未下发时显示 `0`。

| 指标 | 含义 | 字段 |
| --- | --- | --- |
| 手动 · 当前为 **waiting**（等待操作）的任务数 | 快照：当前处于 `waiting` 状态且 `runnerType === manual` 的任务数量 | **`waitingByRunnerType.manual`**，或 **`runnerTypeStats.manual.waiting`** |
| 系统 · 同上 | `runnerType === system` | **`waitingByRunnerType.system`**，或 **`runnerTypeStats.system.waiting`** |
| 手动 · **当日完成**任务数 | 完成时间落在「当日」（由后端按 `timezone` 划界）的手动任务数 | **`completedToday.manual`**（顶层字段，与 `waitingByRunnerType` 并列） |
| 系统 · 当日完成 | 同上 | **`completedToday.system`** |

（不再使用 `todayCompletedByRunnerType`、`runnerTypeStats.*.completedToday`、`todayCompleted`、`executedToday` 等别名。）

### 其它常用 SSE 字段（节选）

| 字段 | 说明 |
| --- | --- |
| `date` | 服务端「今日」日期（YYYY-MM-DD，可与 timezone 对齐校验） |
| `totalTasks` | 今日任务量等总览 |
| `byStatus` | 各状态计数（含 `waiting`，与 `pending` 不同） |
| `byType` / `byRunnerType` | 按类型 / 按执行方式聚合 |
| `hourlyTrend` / `hourlyTrendByStatus` / `hourlyTrendByType` | 今日按小时序列 |
| `completedToday` | **当日完成**按 `manual` / `system` 分组（顶层对象，与 `waitingByRunnerType` 并列） |
| `pendingByRunnerType` | **pending（等待执行）** 按 `manual` / `system` 分组；与看板「手动等待操作数」（`waiting`）无关 |
| `runnerTypeStats` | 可按 runner 扩展；看板「手动等待操作数」仅读 **`waiting` / `waitingCount`**；**`executed`** 勿用作「当日完成」（当日完成仅 **`completedToday`**） |
| `todayDuration` | 今日耗时统计（均值等） |
