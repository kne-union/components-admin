|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|avatar|用户头像 URL|string|-|
|name|用户名称，不传或为空时显示"未命名"|string|-|
|email|用户邮箱|string|-|
|list|操作列表，每项包含 iconType、label、onClick|Array<{iconType: string, label: string, onClick: function}>|-|
|children|自定义子元素，显示在下拉菜单的用户信息和操作列表之间|ReactNode|-|
|storeKeys|退出登录时清除的存储 key|object|{ token: 'X-User-Token' }|
|domain|退出登录时跳转的域名|string|-|
