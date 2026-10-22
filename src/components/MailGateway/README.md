# MailGateway

### 概述

`@kne/fastify-mail-gateway` 邮件网关的管理后台。在一个页面里托管多个企业邮箱，收件、发件、草稿统一管理，并通过可视化的收发规则让邮件自动打标签、自动回复、转发或触发系统里的其它功能。

**核心特性**

- **统一邮箱**：左侧切换邮箱账号与文件夹（收件箱、已发送、草稿箱、已删除），收件箱有新邮件时红色显示「未读 / 总数」、没有时灰色只显示总数，草稿箱与标签显示数量（超过 999 显示 999+）；标签直接作为文件夹浏览
- **写信与草稿**：富文本写信，支持回复、回复全部、转发（自动带引用与邮件头）、存草稿和草稿续写发送
- **邮件模版**：富文本编辑模版，按分类管理、启用 / 停用、复制与示例预览；写信时一键套用，自动回复动作可直接引用模版，主题和正文支持原邮件、发件邮箱变量
- **系统默认与自定义**：模版与分类区分系统默认（服务端启动时从模版目录载入，只能启停、排序、复制）和自定义（界面新建，可任意编辑）
- **邮箱账号**：配置 IMAP / SMTP，保存前校验连接，可单独测试连接、手动触发增量同步并查看最近错误
- **收发规则**：条件（发件人、主题、正文、附件等，全部或任一满足）+ 有序动作链；动作与扩展条件（如 AI 判断）的参数表单根据服务端元数据动态生成，宿主注册后无需改前端即可配置
- **试运行与日志**：选择一封真实邮件试运行规则，查看逐条条件是否命中；规则日志记录每次执行的动作结果与耗时

**适用场景**

- 客服、财务、招聘等共享邮箱的集中收发与分类
- 统一维护受理通知、发票开具、面试邀请等常用邮件模版
- 来信自动回复受理通知、紧急邮件转发值班人
- 邮件到达后通过 Webhook 或宿主动作同步 CRM、生成工单

**技术亮点**

- 基于 BizUnit 与 TablePage 的配置化页面，与其它管理模块交互一致
- 规则动作与扩展条件的参数子表单由服务端返回的 FormCreator Schema 定义并渲染，邮件专用字段（标签、模版、邮箱、富文本、JSON 等）注册为 FormCreator 字段类型，扩展动作和条件零前端改动
- `Compose`、`AccountSelectField`、`LabelSelectField`、`TemplateSelectField` 可单独复用到业务页面


### 示例(全屏)

#### 示例代码

- 完整模块
- 邮件网关管理后台：左侧切换邮箱账号与文件夹（收件箱、已发送、草稿箱、已删除），标签按文件夹展示；菜单进入邮箱账号、标签管理、邮件模版、收发规则、规则日志。
- _MailGateway(@components/MailGateway),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { default: MailGateway } = _MailGateway;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/MailGateway/route';
const pageProps = { menuFixed: false };

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path={&#96;${baseUrl}/*&#96;} element={<MailGateway baseUrl={baseUrl} pageProps={pageProps} />} />
          <Route path="*" element={<Navigate to={baseUrl} replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- SystemLayout 布局
- 宿主使用 @kne/system-layout 时：getMenuItems 生成 SystemLayout 侧栏菜单（图标由宿主补充），renderPage 交给 Page 承载各子页面标题与内容；模块不再渲染自带的左侧菜单，邮箱页的账号切换、文件夹与标签侧栏放在页面内容区左侧。
- _MailGateway(@components/MailGateway),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),_systemLayout(@kne/system-layout),(@kne/system-layout/dist/index.css),reactRouterDom(react-router-dom)

```jsx
const { default: MailGateway, getMenuItems } = _MailGateway;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { default: SystemLayout, Page } = _systemLayout;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/MailGateway/system-layout';

const menu = { base: baseUrl, items: getMenuItems() };

// 各子页面的标题与内容交给 system-layout 的 Page 承载，模块不再渲染自带的左侧菜单
const renderPage = ({ title, children }) => <Page title={title}>{children}</Page>;

const SystemLayoutExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <SystemLayout userInfo={{ name: '林晓', description: '客服主管 · 领英智能' }} menu={menu}>
        <Routes>
          <Route path={&#96;${baseUrl}/*&#96;} element={<MailGateway baseUrl={baseUrl} renderPage={renderPage} />} />
          <Route path="*" element={<Navigate to={baseUrl} replace />} />
        </Routes>
      </SystemLayout>
    </PureGlobal>
  );
});

render(<SystemLayoutExample />);

```

- 写信与选择字段
- 在业务页面中复用 Compose 按钮发起写信、回复、回复全部、转发和编辑草稿；AccountSelectField / LabelSelectField 可直接放进 FormInfo 表单。
- _MailGateway(@components/MailGateway),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { Compose, AccountSelectField, LabelSelectField } = _MailGateway;
const { default: mockPreset, mailGatewayData } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Flex, Typography, App } = antd;

const customerMail = mailGatewayData.mails.find(item => item.folder === 'inbox');
const draftMail = mailGatewayData.mails.find(item => item.folder === 'draft');
const serviceAccount = mailGatewayData.accounts.find(item => item.id === customerMail.accountId);

const ComposeDemo = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { message } = App.useApp();
  const onSuccess = () => message.info('邮件已提交到网关，可在“已发送 / 草稿箱”查看');
  return (
    <Flex vertical gap={24}>
      <Flex vertical gap={8}>
        <Typography.Text strong>写信 / 回复 / 转发 / 编辑草稿</Typography.Text>
        <Typography.Text type="secondary">{&#96;原邮件：${customerMail.subject}&#96;}</Typography.Text>
        <Flex gap={8} wrap>
          <Compose type="primary" accountId={serviceAccount.id} onSuccess={onSuccess} />
          <Compose mode="reply" mail={customerMail} accountId={serviceAccount.id} accountAddress={serviceAccount.address} onSuccess={onSuccess}>
            回复客户
          </Compose>
          <Compose mode="replyAll" mail={customerMail} accountId={serviceAccount.id} accountAddress={serviceAccount.address} onSuccess={onSuccess}>
            回复全部
          </Compose>
          <Compose mode="forward" mail={customerMail} accountId={serviceAccount.id} onSuccess={onSuccess}>
            转发给同事
          </Compose>
          <Compose mode="draft" mail={draftMail} onSuccess={onSuccess}>
            继续编辑草稿
          </Compose>
        </Flex>
      </Flex>
      <Flex vertical gap={8}>
        <Typography.Text strong>邮箱 / 标签选择字段</Typography.Text>
        <Form onSubmit={data => message.success(JSON.stringify(data))}>
          <FormInfo
            column={1}
            list={[
              <AccountSelectField name="accountId" label="邮箱" rule="REQ" onlyEnabled />,
              <LabelSelectField name="labelIds" label="标签" accountId={serviceAccount.id} />
            ]}
          />
          <SubmitButton>提交</SubmitButton>
        </Form>
      </Flex>
    </Flex>
  );
});

const ComposeExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <ComposeDemo />
    </PureGlobal>
  );
});

render(<ComposeExample />);

```

- 扩展动作与条件
- 宿主在服务端注册「创建售后工单」动作和「AI 判断」条件后，规则编辑器自动出现它们；参数子表单由服务端 formSchema（FormCreator Schema）定义，其中的自定义字段类型 TicketQueue 由宿主通过 FormCreator preset 注册。点击「添加」新建规则：条件字段下拉的「扩展条件」分组里选择「AI 判断」并填写判断要求（示例用关键词模拟大模型），动作中选择「创建售后工单」；保存后在卡片菜单里「试运行」可看到每个条件的命中结果与 AI 给出的理由。
- _MailGateway(@components/MailGateway),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { Rule } = _MailGateway;
const { default: mockPreset, mailGatewayData } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Radio } = antd;

// 服务端通过 services.action.register / options.actions 注册的动作（含 formSchema），会出现在 GET /actions 的返回里；
// 通过 services.condition.register / options.conditions 注册的条件（如 AI 判断），会出现在 GET /rules/options 的 extensions 里。这里在 mock 中模拟
const actionApis = mockPreset.apis.mailGateway.action;
const ruleApis = mockPreset.apis.mailGateway.rule;
const preset = Object.assign({}, mockPreset, {
  apis: Object.assign({}, mockPreset.apis, {
    mailGateway: Object.assign({}, mockPreset.apis.mailGateway, {
      action: Object.assign({}, actionApis, {
        list: Object.assign({}, actionApis.list, {
          loader: async props => {
            const direction = props?.params?.direction;
            const builtIn = await actionApis.list.loader(props);
            return [...builtIn, ...mailGatewayData.customActions.filter(item => !direction || item.directions.includes(direction))];
          }
        })
      }),
      rule: Object.assign({}, ruleApis, {
        options: Object.assign({}, ruleApis.options, {
          loader: async props => Object.assign({}, await ruleApis.options.loader(props), { extensions: mailGatewayData.customConditions })
        })
      })
    })
  })
});

const ticketQueues = [
  { label: '售后服务', value: 'after-sale' },
  { label: '技术支持', value: 'tech-support' },
  { label: '投诉处理', value: 'complaint' }
];

const TicketQueueInput = ({ value, onChange }) => (
  <Radio.Group optionType="button" buttonStyle="solid" options={ticketQueues} value={value} onChange={e => onChange(e.target.value)} />
);

// FormCreator 字段类型的 component 须为 FormInfo 字段组件，用 FormInfo.hooks.useOnChange 包装
const TicketQueueField = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, ...props }) => {
  const [FormInfo] = remoteModules;
  const render = FormInfo.hooks.useOnChange(props);
  return render(TicketQueueInput);
});

let ticketQueueRegistered = false;

const CustomActionExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout', 'components-thirdparty:FormCreator@preset']
})(({ remoteModules }) => {
  const [PureGlobal, Layout, formCreatorPreset] = remoteModules;
  // 动作 formSchema 中 type 为 TicketQueue 的字段使用这个控件
  if (!ticketQueueRegistered) {
    ticketQueueRegistered = true;
    formCreatorPreset({
      fields: {
        TicketQueue: { label: '工单队列', groupName: '工单', component: TicketQueueField, valueSchema: { type: 'string' } }
      }
    });
  }
  return (
    <PureGlobal preset={preset}>
      <Layout navigation={{ isFixed: false }}>
        <Rule pageProps={{ menu: null, menuFixed: false }} />
      </Layout>
    </PureGlobal>
  );
});

render(<CustomActionExample />);

```

### API

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

收发规则页：按触发时机（收信后 / 发信前 / 发信后 / 未读邮件）、适用邮箱、优先级配置条件与动作链，支持启用 / 停用、排序和试运行。发信前规则可拦截发送、修改主题、正文、收件人或改存草稿，只在发信时执行，试运行不提供「执行规则」。未读邮件规则定时检查，需配置统计时间窗口、未读邮件数量和触发间隔，条件用于筛选计入统计的未读邮件，达到数量后批量执行动作（如汇总转发、标为已读），同样不提供「执行规则」。发信被规则改存草稿时，写信弹窗提示「邮件未发送，已存入草稿箱」。

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
| mailRuleDirection     | receive、beforeSend、send、schedule                        |
| mailRuleStatus        | enabled、disabled                                          |
| mailTemplateStatus    | enabled、disabled                                          |
| mailTemplateLevel     | 0（系统默认）、1（自定义）                                 |
| mailRuleLogStatus     | success、partial、failed                                   |
| mailConditionField    | from、to、cc、subject、text、hasAttachment、accountId      |
| mailConditionOperator | contains、notContains、equals、startsWith、endsWith、regex |
