# MessageManger

### 概述

`MessageManger` 是基于 `fastify-message` 的消息管理组件，提供消息模板列表和发送记录列表。组件按后端真实接口组织参数，支持按模板类型、编码、级别、状态和发送对象筛选，并可查看模板内容、发送参数和最终发送内容。


### 示例(全屏)

#### 示例代码

- 消息管理
- 基于 fastify-message 的消息模板和发送记录管理示例
- _MessageManger(@components/MessageManger),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom),antd(antd)

```jsx
const { default: MessageManger } = _MessageManger;
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
            path="/MessageManger/message/*"
            element={
              <MessageManger baseUrl="/MessageManger/message" pageProps={{ menuFixed: false }}>
                <Flex gap={8} wrap="wrap">
                  <Button onClick={() => navigate('/MessageManger/message')}>消息模板</Button>
                  <Button onClick={() => navigate('/MessageManger/message/records')}>发送记录</Button>
                </Flex>
              </MessageManger>
            }
          />
          <Route path="*" element={<Navigate to="/MessageManger/message" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|baseUrl|组件挂载的路由根路径，用于内部菜单跳转|string|-|
|pageProps|透传给 `TablePage` 的页面配置|object|{}|
|children|追加渲染在内部路由中的内容|ReactNode|-|

### 依赖接口

组件默认读取 `usePreset().apis.messageManger`：

|接口|方法|路径|说明|
|  ---  | --- | --- | --- |
|messageManger.templates.list|GET|`/message/templates`|消息模板列表|
|messageManger.templates.detail|GET|`/message/templates/:id`|消息模板详情|
|messageManger.records.list|GET|`/message/records`|发送记录列表|
|messageManger.records.detail|GET|`/message/records/:id`|发送记录详情|

### 内部路由

|路径|说明|
|  ---  | --- |
|`/`|消息模板列表|
|`/records`|发送记录列表|
