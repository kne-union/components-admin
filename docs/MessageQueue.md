# MessageQueue

### 概述

MessageQueue 是面向 `fastify-mq` 的消息队列管理端组件，提供队列运行概览、消息发布与查询、死信处理、轨迹追踪和队列维护工具。

组件直接对齐 `fastify-mq` 的接口契约，列表筛选使用后端支持的扁平查询参数，死信支持单条与批量重放，Dashboard 展示队列深度、消费速率、失败率、死信速率和成功率等关键指标。

适用于需要在后台管理系统中观察异步消息处理状态、排查失败消息、追踪消息生命周期，以及执行基础队列运维操作的业务场景。


### 示例(全屏)

#### 示例代码

- 基础用法
- 完整展示 MessageQueue 的仪表盘、消息列表、死信队列、轨迹追踪和队列工具页。
- _MessageQueue(@components/MessageQueue),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom),antd(antd)

```jsx
const { default: MessageQueue } = _MessageQueue;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useNavigate, Navigate, Route, Routes } = reactRouterDom;
const { Button, Flex } = antd;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const navigate = useNavigate();
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route
            path="/MessageQueue/mq/*"
            element={
              <MessageQueue baseUrl="/MessageQueue/mq" pageProps={{ menuFixed: false }}>
                <Flex gap={8} wrap="wrap">
                  <Button onClick={() => navigate('/MessageQueue/mq')}>仪表盘</Button>
                  <Button onClick={() => navigate('/MessageQueue/mq/messages')}>消息列表</Button>
                  <Button onClick={() => navigate('/MessageQueue/mq/dead-letter')}>死信队列</Button>
                  <Button onClick={() => navigate('/MessageQueue/mq/traces')}>轨迹追踪</Button>
                  <Button onClick={() => navigate('/MessageQueue/mq/tools')}>队列工具</Button>
                </Flex>
              </MessageQueue>
            }
          />
          <Route path="*" element={<Navigate to="/MessageQueue/mq" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 消息详情
- 展示独立使用消息操作按钮查看消息详情。
- _MessageQueue(@components/MessageQueue),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { Actions } = _MessageQueue;
const { default: mockPreset, messageQueueList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card, Space } = antd;

const MessageDetailExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const data = messageQueueList.pageData[0];
  return (
    <PureGlobal preset={mockPreset}>
      <Card title="消息详情操作" size="small">
        <Space>
          <span>{data.topic}</span>
          <Actions data={data} type="primary" />
        </Space>
      </Card>
    </PureGlobal>
  );
});

render(<MessageDetailExample />);

```

- 死信重放
- 展示独立使用死信操作按钮提交重放。
- _MessageQueue(@components/MessageQueue),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { DeadLetterActions } = _MessageQueue;
const { default: mockPreset, deadLetterList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card, Space } = antd;

const DeadLetterReplayExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const data = deadLetterList.pageData.find(item => !item.replayed);
  return (
    <PureGlobal preset={mockPreset}>
      <Card title="死信重放操作" size="small">
        <Space>
          <span>{data.topic}</span>
          <DeadLetterActions data={data} type="primary" />
        </Space>
      </Card>
    </PureGlobal>
  );
});

render(<DeadLetterReplayExample />);

```

- 枚举值
- 展示消息状态和轨迹事件枚举。
- _MessageQueue(@components/MessageQueue),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { enums } = _MessageQueue;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Card, Space, Tag } = antd;

const EnumsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const getColor = type => ({ success: 'green', danger: 'red', progress: 'blue', info: 'default' })[type] || 'default';
  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="消息状态">
          <Space wrap>
            {enums.messageStatus.map(item => (
              <Tag key={item.value} color={getColor(item.type)}>{item.value} - {item.description}</Tag>
            ))}
          </Space>
        </Card>
        <Card title="轨迹事件">
          <Space wrap>
            {enums.traceEvent.map(item => (
              <Tag key={item.value} color={getColor(item.type)}>{item.value} - {item.description}</Tag>
            ))}
          </Space>
        </Card>
      </Space>
    </PureGlobal>
  );
});

render(<EnumsExample />);

```

### API

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
