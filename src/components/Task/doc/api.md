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
