|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|name|表单字段名称|string|-|
|label|表单标签|string|-|
|rule|校验规则，如 'REQ' 表示必填|string|-|
|placeholder|占位文本|string|-|
|status|用户状态筛选，0 表示活跃用户，null 表示不筛选|number|null|
|single|是否单选，true 为单选，false 为多选|boolean|true|
|disabled|是否禁用|boolean|false|
|api|自定义 API 配置，会覆盖默认的 getUserList 接口|object|-|
