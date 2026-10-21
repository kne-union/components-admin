### MailGateway

邮件网关管理后台入口，内部使用 `AppChildrenRouter` 组织邮箱、邮箱账号、联系人、标签、邮件模版、模版分类、规则、规则日志八个子页面，需挂在 `${baseUrl}/*` 路由下。接口来自 `usePreset().apis.mailGateway`，对应 `@kne/fastify-mail-gateway` 的 `/mail-gateway` 路由。

#### 属性说明

| 属性名      | 类型      | 必填 | 默认值 | 说明                                                                                                                                      |
| ----------- | --------- | ---- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| baseUrl     | string    | 是   | -      | 模块根路径，子页面为 `baseUrl`（邮箱）、`/accounts`、`/contacts`、`/labels`、`/templates`、`/template-categories`、`/rules`、`/rule-logs` |
| pageProps   | object    | 否   | {}     | 透传给各页面的 Page / TablePage 配置（仅默认布局生效）                                                                                    |
| renderPage  | function  | 否   | -      | `({ title, children }) => ReactNode`，由宿主承载各子页面的标题与内容（如 `@kne/system-layout` 的 `Page`）；设置后不再渲染模块自带的左侧菜单 |
| getContacts | function  | 否   | -      | 外部联系人 `({ keyword }) => Promise<[{ name, address, avatar?, description? }]>`，与内置联系人合并、按地址去重后供地址输入框选择         |
| children    | ReactNode | 否   | -      | 透传给 `AppChildrenRouter`                                                                                                                |

### Mailbox

邮箱页：左侧邮箱账号切换、文件夹与标签菜单，右侧邮件列表（关键字搜索、批量已读 / 未读 / 删除 / 恢复、星标），点击主题打开详情抽屉。

#### 属性说明

| 属性名    | 类型   | 必填 | 默认值 | 说明       |
| --------- | ------ | ---- | ------ | ---------- |
| baseUrl   | string | 否   | -      | 菜单根路径 |
| pageProps | object | 否   | {}     | 页面配置   |

### Account

邮箱账号列表页：新增 / 编辑 IMAP、SMTP 配置，启用 / 停用、删除、设为默认、测试连接、立即同步。编辑时密码留空表示不修改。第一个添加的邮箱自动成为默认邮箱，卡片上显示「默认」标签；写信时发件邮箱默认选中默认邮箱。

#### 属性说明

| 属性名    | 类型   | 必填 | 默认值 | 说明       |
| --------- | ------ | ---- | ------ | ---------- |
| baseUrl   | string | 否   | -      | 菜单根路径 |
| pageProps | object | 否   | {}     | 页面配置   |

### Label

标签管理页：名称、颜色、所属邮箱（为空表示全局标签），支持上移 / 下移排序。

#### 属性说明

| 属性名    | 类型   | 必填 | 默认值 | 说明       |
| --------- | ------ | ---- | ------ | ---------- |
| baseUrl   | string | 否   | -      | 菜单根路径 |
| pageProps | object | 否   | {}     | 页面配置   |

### Template

邮件模版页：富文本编辑模版正文，按分类、类型（系统默认 / 自定义）、状态筛选，按名称 / 主题搜索；支持启用 / 停用、复制（副本默认停用）、示例数据预览。系统默认模版由服务端 `templateDir` 在启动时载入，界面上不提供编辑和删除，需要调整时复制为自定义模版后修改。主题和正文可使用 `{{mail.subject}}`、`{{mail.from[0].name}}`、`{{account.name}}` 等变量，写信套用或自动回复时由服务端渲染。

#### 属性说明

| 属性名    | 类型   | 必填 | 默认值 | 说明                                                                      |
| --------- | ------ | ---- | ------ | ------------------------------------------------------------------------- |
| baseUrl   | string | 否   | -      | 菜单根路径；标题区的「模版分类」按钮跳转 `${baseUrl}/template-categories` |
| pageProps | object | 否   | {}     | 页面配置                                                                  |

### TemplateCategory

模版分类页：名称、描述、类型、模版数，支持上移 / 下移排序。删除分类后其下模版变为未分类。系统默认分类只能排序，不提供编辑和删除；自定义模版也可以归入系统默认分类。

#### 属性说明

| 属性名    | 类型   | 必填 | 默认值 | 说明       |
| --------- | ------ | ---- | ------ | ---------- |
| baseUrl   | string | 否   | -      | 菜单根路径 |
| pageProps | object | 否   | {}     | 页面配置   |

### Rule

收发规则页：按触发时机（收信后 / 发信前 / 发信后）、适用邮箱、优先级配置条件与动作链，支持启用 / 停用、排序和试运行。发信前规则可拦截发送或修改主题、正文、收件人，只在发信时执行，试运行不提供「执行规则」。

#### 属性说明

| 属性名    | 类型   | 必填 | 默认值 | 说明       |
| --------- | ------ | ---- | ------ | ---------- |
| baseUrl   | string | 否   | -      | 菜单根路径 |
| pageProps | object | 否   | {}     | 页面配置   |

#### 动作参数表单

每个动作的参数子表单由 `apis.mailGateway.action.list` 返回的 `formSchema`（`@kne/form-creator` 搭建 Schema）定义，规则编辑器用 `components-thirdparty:FormCreator@SchemaRendererInner` 渲染在动作卡片内，字段值即该动作的 `params`。字段 `rule` 含 `REQ` 时必填，默认值写在字段 `props.defaultValue`，切换动作类型时重新填入。

字段 `type` 可用 FormCreator 内置类型（`Input`、`TextArea`、`InputNumber`、`Switch`、`Select`、`RadioGroup` 等），以及本模块注册的邮件字段：

| type               | 控件                 | 说明                                                                                |
| ------------------ | -------------------- | ----------------------------------------------------------------------------------- |
| MailLabelSelect    | 标签选择             | 默认多选                                                                            |
| MailTemplateSelect | 邮件模版选择         | 按分类分组，只列出启用的模版；如自动回复的 `templateId`                             |
| MailContactSelect  | 邮箱地址多值输入     | 可从联系人选择或直接输入地址                                                        |
| MailEditor         | 富文本编辑器（HTML） | 邮件预设工具栏与样式；「变量」可插入模板变量，保存为 `{{mail.subject}}` 等标签      |
| MailTemplateText   | 单行模版文本         | 编辑器仅保留「变量」与源码，保存为纯文本（如 `Re: {{mail.subject}}`），适合邮件主题 |
| MailJson           | JSON 编辑器          | 输入合法 JSON 后以对象保存                                                          |

**扩展动作**：动作由服务端注册（`@kne/fastify-mail-gateway` 的 `options.actions` 或 `services.action.register`），在 `formSchema` 中声明参数表单，注册后自动出现在规则编辑器中，前端无需改动。需要上表以外的控件时，宿主用 `components-thirdparty:FormCreator@preset` 注册字段类型（`component` 须为 FormInfo 字段组件，可用 `FormInfo.hooks.useOnChange` 包装），再在 `formSchema` 中引用该 `type`，见示例「扩展动作类型」。

```js
formCreatorPreset({
  fields: {
    TicketQueue: { label: '工单队列', component: TicketQueueField, valueSchema: { type: 'string' } }
  }
});
```

#### 扩展条件

条件字段下拉在内置字段之外，列出 `apis.mailGateway.rule.options` 返回的 `extensions`（服务端 `options.conditions` 或 `services.condition.register` 注册），以「内置条件 / 扩展条件」分组展示；不支持当前触发时机的扩展条件不出现在下拉中。选中扩展条件后，条件行用其 `formSchema` 渲染参数表单（字段规则与动作参数表单相同），保存为 `{ type, params }`；参数名不能使用 `field`、`operator`、`value`。

模块只负责配置与展示，判断逻辑在服务端 `evaluate` 中实现。例如宿主用大模型判断邮件意图：

```js
// 服务端
fastify.mailGateway.services.condition.register('aiJudge', {
  label: 'AI 判断',
  description: '由大模型判断邮件是否符合描述',
  directions: ['receive'],
  formSchema: { blocks: [{ kind: 'formInfo', list: [{ type: 'TextArea', name: 'prompt', label: '判断描述', rule: 'REQ' }] }] },
  evaluate: async ({ mail, params }) => fastify.ai.services.judge({ prompt: params.prompt, content: `${mail.subject}\n${mail.text}` }) // 返回 boolean 或 { matched, reason }
});
```

试运行结果中扩展条件显示 `reason`（判断理由）与 `error`；已保存规则引用的扩展条件被注销时，条件行提示未注册。见示例「扩展动作与条件」。

### RuleLog

规则日志页：按规则、邮箱、触发时机、执行结果筛选，查看每个动作的执行结果与耗时。发信前规则拦截或出错的邮件未入库，主题显示为「邮件未发送」，且不提供重新执行。

#### 属性说明

| 属性名    | 类型   | 必填 | 默认值 | 说明       |
| --------- | ------ | ---- | ------ | ---------- |
| baseUrl   | string | 否   | -      | 菜单根路径 |
| pageProps | object | 否   | {}     | 页面配置   |

### Menu

模块左侧菜单。

#### 属性说明

| 属性名      | 类型    | 必填 | 默认值 | 说明                 |
| ----------- | ------- | ---- | ------ | -------------------- |
| baseUrl     | string  | 是   | -      | 模块根路径           |
| withMailbox | boolean | 否   | true   | 是否显示"邮箱"菜单项 |

### getMenuItems

`getMenuItems({ locale }) => [{ key, path, icon, label }]`，返回模块菜单项。`path` 相对模块根路径（邮箱为 `'/'`），可直接作为 `@kne/system-layout` 的 `menu.items`（`menu.base` 设为 `baseUrl`）；`icon` 为 `@ant-design/icons` 节点，宿主可按 `key` 替换。`locale` 默认 `zh-CN`。

### SystemLayout 布局

宿主使用 `@kne/system-layout` 时，用 `getMenuItems` 生成侧栏菜单，并传入 `renderPage` 让 `Page` 承载各子页面：

```jsx
const renderPage = ({ title, children }) => <Page title={title}>{children}</Page>;

<SystemLayout menu={{ base: baseUrl, items: getMenuItems() }}>
  <Routes>
    <Route path={`${baseUrl}/*`} element={<MailGateway baseUrl={baseUrl} renderPage={renderPage} />} />
  </Routes>
</SystemLayout>;
```

列表页的操作按钮随表格工具栏渲染；邮箱页的账号切换、文件夹与标签侧栏放在页面内容区左侧；内容区宽度不足（按容器宽度判断，宽屏下的窄内容区同样生效）时侧栏收起为顶部切换条，点击从左侧抽屉打开。见示例「SystemLayout 布局」。

### Compose

写信按钮，点击打开写信弹窗，可发送或存草稿。弹窗顶部可选择邮件模版套用主题和正文（回复 / 转发时保留原邮件引用，并以原邮件与当前发件邮箱渲染变量）。其余属性透传给 antd `Button`。

写信、回复、转发、草稿与邮件模版、自动回复正文的富文本统一使用 `components-thirdparty:CKEditor` 的邮件预设（`EMAIL_TOOLBAR_ITEMS` 工具栏 + `EMAIL_STYLE_DEFINITIONS` 样式），输出内容自带 inline style，可直接投递。写信类编辑器不显示模版变量；模版与自动回复保留模版变量。服务端只做 `{{path}}` 替换，因此均不提供模版条件。

#### 属性说明

| 属性名         | 类型                                                   | 必填 | 默认值 | 说明                                                       |
| -------------- | ------------------------------------------------------ | ---- | ------ | ---------------------------------------------------------- |
| mode           | 'new' \| 'reply' \| 'replyAll' \| 'forward' \| 'draft' | 否   | 'new'  | 写信模式；回复 / 转发自动带主题前缀、引用与 In-Reply-To 头 |
| mail           | object                                                 | 否   | -      | 原邮件（reply / replyAll / forward）或草稿（draft）        |
| accountId      | string                                                 | 否   | -      | 默认发件邮箱                                               |
| accountAddress | string                                                 | 否   | -      | 发件邮箱地址，回复全部时用于排除自己                       |
| onSuccess      | function                                               | 否   | -      | 发送或存草稿成功后回调                                     |
| children       | ReactNode                                              | 否   | 写邮件 | 按钮文案                                                   |

### MailDetail

邮件详情，按 `id` 加载并展示邮件头、标签、附件和正文，内置回复、转发、设置标签、星标、删除 / 恢复等操作。点击附件预览（`components-core:File@useFileModal`）：收信附件首次点击时调用 `apis.mailGateway.mail.downloadAttachment` 从邮件服务器下载并保存到文件存储，完成后自动打开预览，已下载的直接预览；转发时未下载的附件以 `{ mailId, index }` 传给服务端，发送前自动下载。

#### 属性说明

| 属性名         | 类型     | 必填 | 默认值 | 说明                                 |
| -------------- | -------- | ---- | ------ | ------------------------------------ |
| id             | string   | 是   | -      | 邮件 ID                              |
| accountAddress | string   | 否   | -      | 所属邮箱地址，回复全部时用于排除自己 |
| onChange       | function | 否   | -      | 邮件状态变更后回调                   |
| onClose        | function | 否   | -      | 删除等操作后需要关闭详情时回调       |

### AccountSelect / AccountSelectField

邮箱账号下拉；`AccountSelectField` 为 FormInfo 字段版本。其余属性透传给 antd `Select`。

| 属性名      | 类型    | 必填 | 默认值     | 说明             |
| ----------- | ------- | ---- | ---------- | ---------------- |
| onlyEnabled | boolean | 否   | false      | 停用的邮箱不可选 |
| placeholder | string  | 否   | 请选择邮箱 | 占位文案         |

### LabelSelect / LabelSelectField

标签下拉（默认多选）；`LabelSelectField` 为 FormInfo 字段版本。其余属性透传给 antd `Select`。

| 属性名      | 类型   | 必填 | 默认值     | 说明                                 |
| ----------- | ------ | ---- | ---------- | ------------------------------------ |
| accountId   | string | 否   | -          | 传入后只列出该邮箱专属标签与全局标签 |
| placeholder | string | 否   | 请选择标签 | 占位文案                             |

### TemplateSelect / TemplateSelectField

邮件模版下拉，按分类分组；`TemplateSelectField` 为 FormInfo 字段版本。其余属性透传给 antd `Select`。

| 属性名      | 类型    | 必填 | 默认值         | 说明                 |
| ----------- | ------- | ---- | -------------- | -------------------- |
| categoryId  | string  | 否   | -              | 只列出该分类下的模版 |
| onlyEnabled | boolean | 否   | true           | 只列出启用的模版     |
| placeholder | string  | 否   | 请选择邮件模版 | 占位文案             |

### TemplateCategorySelect / TemplateCategorySelectField

模版分类下拉；`TemplateCategorySelectField` 为 FormInfo 字段版本。其余属性透传给 antd `Select`。

| 属性名      | 类型   | 必填 | 默认值         | 说明     |
| ----------- | ------ | ---- | -------------- | -------- |
| placeholder | string | 否   | 请选择模版分类 | 占位文案 |

### enums

模块使用的枚举，宿主需合并进 preset 的 `enums`，列表中的状态、触发时机等列才能正常显示。

| 枚举名                | 取值                                                       |
| --------------------- | ---------------------------------------------------------- |
| mailFolder            | inbox、sent、draft、trash                                  |
| mailAccountStatus     | enabled、disabled                                          |
| mailRuleDirection     | receive、beforeSend、send                                  |
| mailRuleStatus        | enabled、disabled                                          |
| mailTemplateStatus    | enabled、disabled                                          |
| mailTemplateLevel     | 0（系统默认）、1（自定义）                                 |
| mailRuleLogStatus     | success、partial、failed                                   |
| mailConditionField    | from、to、cc、subject、text、hasAttachment、accountId      |
| mailConditionOperator | contains、notContains、equals、startsWith、endsWith、regex |
