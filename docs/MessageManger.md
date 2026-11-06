# MessageManger

### 概述

`MessageManger` 是基于 `fastify-message` 的消息管理组件，提供消息模板管理和发送记录列表。模板使用 Liquid 语法（`{{ 变量 }}`、`{% if %}`），可在后台新建、编辑、启停、复制和删除业务模板，系统模板只读。组件按后端真实接口组织参数，支持按模板类型、级别、状态和关键词筛选，可预览模板渲染效果，发送时按模板声明的变量逐项填写参数，并可查看发送参数和最终发送内容。


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

| 属性名    | 说明                                                           | 类型      | 默认值 |
| --------- | -------------------------------------------------------------- | --------- | ------ |
| baseUrl   | 组件挂载的路由根路径，用于内部菜单跳转                         | string    | -      |
| pageProps | 透传给模板列表 `BizUnit` 页面及记录列表 `TablePage` 的页面配置 | object    | {}     |
| children  | 追加渲染在内部路由中的内容                                     | ReactNode | -      |

### 模板语法

模板使用 `@kne/message-template` 的 Liquid 子集，仅支持：

| 语法                                   | 说明                                                    |
| -------------------------------------- | ------------------------------------------------------- |
| `{{ path }}`                           | 变量插值，支持 `a.b` 嵌套路径；邮件正文中会做 HTML 转义 |
| `{{ path \| raw }}`                    | 输出原始 HTML，不转义                                   |
| `{% if path %}…{% else %}…{% endif %}` | 条件块，不支持嵌套                                      |

邮件模板正文为 HTML，主题为纯文本；短信模板正文为纯文本。系统模板（`level=0`）只读，不可编辑、删除。

### 依赖接口

组件默认读取 `usePreset().apis.messageManger`：

| 接口                              | 方法   | 路径                            | 说明                                                        |
| --------------------------------- | ------ | ------------------------------- | ----------------------------------------------------------- |
| messageManger.templates.list      | GET    | `/message/templates`            | 消息模板列表，支持 `filter.keyword` 搜索名称或 code         |
| messageManger.templates.detail    | GET    | `/message/templates/:id`        | 消息模板详情                                                |
| messageManger.templates.create    | POST   | `/message/templates`            | 新建业务模板                                                |
| messageManger.templates.save      | PUT    | `/message/templates/:id`        | 修改业务模板                                                |
| messageManger.templates.remove    | DELETE | `/message/templates/:id`        | 删除业务模板                                                |
| messageManger.templates.setStatus | POST   | `/message/templates/:id/status` | 启用 / 停用模板                                             |
| messageManger.templates.copy      | POST   | `/message/templates/:id/copy`   | 复制为停用状态的业务模板                                    |
| messageManger.templates.render    | POST   | `/message/templates/render`     | 按模板 id 或模板内容渲染预览，未传 `props` 时使用变量示例值 |
| messageManger.templates.send      | POST   | `/message/templates/send`       | 按模板发送消息                                              |
| messageManger.records.list        | GET    | `/message/records`              | 发送记录列表                                                |
| messageManger.records.detail      | GET    | `/message/records/:id`          | 发送记录详情                                                |

### 模板字段

| 字段        | 说明                                                          | 类型   |
| ----------- | ------------------------------------------------------------- | ------ |
| name        | 模板名称                                                      | string |
| code        | 模板编码，同一类型下唯一                                      | string |
| type        | `0` 邮件，`1` 短信；创建后不可修改                            | number |
| subject     | 邮件主题，支持变量插值                                        | string |
| content     | 模板正文                                                      | string |
| description | 描述                                                          | string |
| variables   | 变量声明 `[{ name, label, example }]`；为空时从模板内容中提取 | array  |
| extra       | 附加字段，如邮件纯文本 `text`                                 | object |

### 导出

| 名称                   | 说明                                                                 |
| ---------------------- | -------------------------------------------------------------------- |
| TemplateFormInner      | 模板新建 / 编辑表单内容，基于 `components-thirdparty:TemplateEditor` |
| toTemplatePayload      | 将表单数据转换为模板接口请求体                                       |
| toTemplateFormData     | 将模板数据转换为表单初始值                                           |
| TemplatePreview        | 调用 render 接口预览模板                                             |
| getTemplateBaseColumns | 模板列表列定义（不含操作列）                                         |

### 内部路由

| 路径       | 说明         |
| ---------- | ------------ |
| `/`        | 消息模板列表 |
| `/records` | 发送记录列表 |
