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
