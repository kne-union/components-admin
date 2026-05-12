# BizUnit 使用指南

## 模块概述

请根据以下规范生成一个完整的前端业务模块，该模块基于BizUnit架构模式，包含完整的CRUD功能、国际化支持、文档示例和可复用的组件结构。

## 目录结构

```
src/components/[ModuleName]/
├── index.js                          # 主入口文件，导出所有组件
├── [ModuleName].js                   # 根组件，路由配置
├── withLocale.js                     # 国际化HOC封装
├── style.module.scss                 # 全局样式文件
├── Actions/                          # 操作按钮组件目录
│   ├── index.js                      # Actions主组件
│   ├── Create.js                     # 新建按钮
│   ├── Save.js                       # 编辑/保存按钮
│   ├── Remove.js                     # 删除按钮
│   └── SetStatus.js                  # 设置状态按钮
├── Detail/                           # 详情页目录
│   ├── index.js                      # 详情页主组件
│   └── RightOptions.js               # 右侧操作按钮
├── FormInner/                        # 表单内部组件目录
│   └── index.js                      # 表单字段定义
├── List/                             # 列表页目录
│   ├── index.js                      # 列表页主组件
│   └── getColumns.js                 # 列配置
├── TabDetail/                        # Tab详情页目录
│   ├── index.js                      # Tab详情页主组件
│   └── [TabName]/                     # 各个Tab内容
├── locale/                           # 国际化文件目录
│   ├── zh-CN.js                      # 中文语言包
│   └── en-US.js                      # 英文语言包
├── doc/                              # 文档和示例目录
│   ├── api.md                        # API文档
│   ├── list.js                       # 列表示例
│   ├── detail.js                     # 详情示例
│   ├── form-inner.js                 # 表单示例
│   ├── tab-detail.js                 # Tab详情示例
│   ├── example.json                  # 示例数据
│   ├── summary.md                    # 摘要说明
│   └── style.scss                    # 文档样式
└── README.md                         # 模块说明文档
```

## 核心组件实现规范

### 1. 主入口文件 (index.js)

导出所有子组件，包括：

- 默认导出：根组件
- 命名导出：List, FormInner, Detail, TabDetail, Actions等

### 2. 根组件 ([ModuleName].js)

- 使用 `createWithRemoteLoader` 进行远程模块加载
- 使用 `ChildrenRouter` 或 `AppChildrenRouter` 进行路由配置
- 配置路由路径和懒加载
- 支持自定义 navigation 和 list 配置

示例结构：

```javascript
import ChildrenRouter from '@kne/app-children-router';
import withLocale from './withLocale';

const ModuleNameInner = ({baseUrl, ...props}) => {
    return (
        <ChildrenRouter
            {...props}
            baseUrl={`${baseUrl}/route-path`}
            list={[
                {index: true, loader: () => import('./List')},
                {path: 'detail', loader: () => import('./Detail')},
                {path: 'tab-detail', loader: () => import('./TabDetail')}
            ]}
        />
    );
};

export default withLocale(ModuleNameInner);
```

### 3. 国际化封装 (withLocale.js)

使用 `createWithIntlProvider` 创建国际化HOC：

```javascript
import {createWithIntlProvider} from '@kne/react-intl';
import zhCN from './locale/zh-CN';
import enUS from './locale/en-US';

const withLocale = createWithIntlProvider({
    defaultLocale: 'zh-CN',
    messages: {
        'zh-CN': zhCN,
        'en-US': enUS
    },
    namespace: 'components-admin:ModuleName'
});

export default withLocale;
```

### 4. 列表页 (List/index.js)

- 使用 `TablePage` 或 `Table` 组件
- 集成 `Filter` 进行筛选
- 使用 `StateBar` 进行状态切换
- 定义 `getColumns` 配置表格列
- 支持 `SearchInput` 关键字搜索
- 支持分页、排序

核心要素：

- `usePreset()` 获取apis配置
- `useIntl()` 获取formatMessage
- `useRef()` 管理表格reload
- `useState()` 管理筛选状态
- `useNavigate()` 路由跳转

### 5. 列配置 (List/getColumns.js)

导出 `getColumns` 函数，接收 `{ navigate, formatMessage }` 参数
列类型包括：

- `serialNumber`: 序号
- `mainInfo`: 主信息（可点击）
- `tag`: 标签
- `description`: 描述
- `datetime`: 日期时间
- `options`: 操作列

### 6. 表单组件 (FormInner/index.js)

- 使用 `FormInfo` 组件
- **详细使用方法请参阅 [FormInfo使用指南.md](./FormInfo使用指南.md)**
- 该指南包含：
    - 完整的字段类型说明（基础输入、选择器、日期时间、业务专用、上传类等）
    - 校验规则配置
    - 列表组件使用
    - 弹窗与抽屉表单
    - 分步表单
    - 表单上下文与API
    - 多语言支持
    - 最佳实践与完整示例

### 7. 详情页 (Detail/index.js)

- 使用 `Fetch` 组件获取详情数据
- 使用 `Page` 和 `InfoPage` 组件
- 使用 `Descriptions` 展示详情信息
- 支持 `RightOptions` 操作按钮

### 8. Tab详情页 (TabDetail/index.js)

- 使用 `StateBarPage` 组件
- 支持多个Tab切换
- 使用 `PageHeader` 显示标题和标签
- 使用 `StateTag` 显示状态标签
- 根据 `searchParams.get('tab')` 切换内容

### 9. Actions组件 (Actions/index.js)

Actions 是一个**条件组合器**，根据业务状态动态组装可用 Action 列表，通过 `ButtonGroup` 统一渲染。

#### 核心架构

```
Actions (组合器)
  ├── 根据 data 条件组装 list 数组
  ├── list 每项: { buttonComponent, data, children, onSuccess, ...props }
  └── <ButtonGroup list={list} /> 或 children({ list }) 自定义渲染
       └── 遍历 list → React.createElement(item.buttonComponent, item)
           ├── Detail      → <Button onClick={modal(DetailContent)} />
           ├── SendMessage  → <Button onClick={modal(Form)} />
           ├── Remove       → <ConfirmButton onClick={ajax(remove)} />
           └── ...
```

#### 实现规范

```javascript
import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import Detail from './Detail';
import SendMessage from './SendMessage';

const ActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, children, data, onSuccess, moreType = 'link', itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();
  const list = [];

  // 始终显示详情按钮
  list.push({
    ...props,
    buttonComponent: Detail,
    data,
    children: formatMessage({ id: 'Detail' }),
    onSuccess
  });

  // 条件显示：状态为启用时才显示发送按钮
  if (Number(data.status) === 0) {
    list.push({
      ...props,
      buttonComponent: SendMessage,
      data,
      children: formatMessage({ id: 'SendMessage' }),
      onSuccess
    });
  }

  // 支持自定义渲染
  if (typeof children === 'function') {
    return children({ list });
  }

  // 默认渲染 ButtonGroup
  return <ButtonGroup itemClassName={itemClassName} list={list} moreType={moreType} />;
});

const Actions = withLocale(ActionsInner);
export { Detail, SendMessage };
export default Actions;
```

#### 关键要点

1. **`list` 项结构**：每项必须包含 `buttonComponent`（组件引用）+ `children`（按钮文字）+ `data` + `onSuccess` + `...props`
2. **`...props` 透传机制**：让 `ButtonGroup` → 个体 Action 之间的属性传递自然流畅，按钮样式（`type="link"`）、`className` 等由上层注入
3. **条件组合**：根据业务状态（如 `data.status`）动态决定显示哪些 Action
4. **双渲染模式**：默认 `<ButtonGroup list={list} />` 自动渲染按钮组（按钮过多时折叠为"更多"下拉）；当 `children` 是函数时，`children({ list })` 让调用方完全掌控渲染
5. **业务区分属性**：如需区分不同业务场景（模板/记录），使用 `detailType` 等语义化命名，**不要占用 `type` 属性**（`type` 专用于按钮样式，如 `type="link"`）

### 10. 各个Action按钮

**核心原则：每个 Action 组件自己渲染自己的 Button，自己管理自己的 Modal/请求逻辑，不依赖外部提供 UI 容器。**

#### 两种 Action 模式

**模式 A — 展示型 Action（详情、错误详情等）**

使用 `Button` + `useModal`，点击按钮打开弹窗展示内容：

```javascript
import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import DetailContent from '../DetailContent';

const DetailInner = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(({ remoteModules, data, ...props }) => {
  const [useModal] = remoteModules;
  const { formatMessage } = useIntl();
  const modal = useModal();

  return (
    <Button
      {...props}    // ← 关键：透传，让 ButtonGroup 控制按钮外观
      onClick={() => {
        modal({
          title: formatMessage({ id: 'Detail' }),
          width: 760,
          footer: null,
          children: <DetailContent data={data} />
        });
      }}
    />
  );
});

const Detail = withLocale(DetailInner);
export default Detail;
```

**模式 B — 操作型 Action（删除、取消、重试等）**

使用 `ConfirmButton`，点击后确认再执行 API 请求：

```javascript
import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const RemoveInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:ConfirmButton']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [usePreset, ConfirmButton] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();

  return (
    <ConfirmButton
      {...props}    // ← 关键：透传
      message={formatMessage({ id: 'DeleteConfirm' })}
      isDelete={true}
      onClick={async () => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.moduleName.remove, {
            data: { id: data.id }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success(formatMessage({ id: 'DeleteSuccess' }));
        onSuccess && onSuccess();
      }}
    />
  );
});

const Remove = withLocale(RemoveInner);
export default Remove;
```

**模式 C — 表单型 Action（新建、编辑、发送等）**

使用 `Button` + `useModal` + `Form`，点击按钮打开表单弹窗：

```javascript
import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const SendMessageInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo', 'components-core:Modal@useModal']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [usePreset, FormInfo, useModal] = remoteModules;
  const { apis, ajax } = usePreset();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const modal = useModal();
  const { Form, FormGroup, FormItem, Input } = FormInfo;

  return (
    <Button
      {...props}    // ← 关键：透传
      onClick={() => {
        modal({
          title: formatMessage({ id: 'SendMessage' }),
          width: 520,
          children: (
            <Form
              onSubmit={async (formData) => {
                const { data: resData } = await ajax(
                  Object.assign({}, apis.moduleName.send, {
                    data: { id: data.id, ...formData }
                  })
                );
                if (resData.code !== 0) {
                  return;
                }
                message.success(formatMessage({ id: 'SendMessageSuccess' }));
                onSuccess && onSuccess();
                return true; // 返回 true 关闭弹窗
              }}
            >
              <FormGroup>
                <FormItem name="name" label="名称" required>
                  <Input />
                </FormItem>
              </FormGroup>
            </Form>
          )
        });
      }}
    />
  );
});

const SendMessage = withLocale(SendMessageInner);
export default SendMessage;
```

#### Action 组件通用规范

| 特性 | 说明 |
|------|------|
| `createWithRemoteLoader` | 声明远程模块依赖，框架异步加载后注入 `remoteModules` |
| `withLocale` 包裹 | 注入 i18n 的 `formatMessage` 能力 |
| 接收 `data` prop | 当前行的数据对象 |
| 接收 `onSuccess` prop | 操作成功后的回调（刷新列表等） |
| `...props` 透传 | **关键机制** — 让 ButtonGroup 能控制按钮外观和行为 |
| **自己渲染自己的 Button** | 每个 Action 是完整自包含的组件，而非单纯的配置项 |
| **独立可用** | 每个 Action 可以脱离 Actions 组合器独立使用（如批量操作场景） |

#### 在 getColumns 中的集成方式

操作列由 Actions 完全接管，不在 getColumns 中手动创建 Button：

```javascript
import Actions from './Actions';

const getColumns = ({ formatMessage, onSuccess }) => [
  // ... 数据列 ...
  {
    name: 'options',
    title: formatMessage({ id: 'Operation' }),
    type: 'options',
    fixed: 'right',
    valueOf: item => ({
      children: <Actions type="link" data={item} onSuccess={onSuccess} />
    })
  }
];
```

**注意**：
- 操作列不需要 `openDetail` 等外部回调，详情等展示型操作由 Action 组件自行管理
- `type="link"` 控制按钮样式为链接型，与 Task 等组件保持一致
- 业务区分属性（如模板/记录）使用 `detailType` 等语义化命名，不占用 `type`

## 国际化文件规范

### zh-CN.js 和 en-US.js

包含以下类型键值：

- 列表列标题：ID, Name, Status, Description, CreatedAt等
- 操作按钮：Add, Edit, Delete, Save等
- 成功提示：AddSuccess, SaveSuccess, DeleteSuccess等
- 确认提示：DeleteConfirm等
- 表单标签：字段名称
- 详情页标题

## API集成规范

通过 `usePreset()` 获取 `apis` 对象，包含：

- `list`: 列表接口
- `detail`: 详情接口
- `create`: 新建接口
- `save`: 编辑接口
- `remove`: 删除接口
- 其他业务接口

## 文档示例规范

### doc/list.js

使用 `PureGlobal` 提供mock数据：

```javascript
const {default: List} = _ModuleName;
const {createWithRemoteLoader} = remoteLoader;
const BaseExample = createWithRemoteLoader({
    modules: ['components-core:Global@PureGlobal', 'components-core:Global@usePreset', 'components-core:Layout']
})(({remoteModules}) => {
    const [PureGlobal, usePreset, Layout] = remoteModules;
    const {ajax} = usePreset();
    return (
        <PureGlobal preset={{ajax, apis: {testApi: {getList, add, save, remove}}}}>
            <Layout navigation={{isFixed: false}}>
                <List/>
            </Layout>
        </PureGlobal>
    );
});
render(<BaseExample/>);
```

### README.md

包含：

- 概述（模块功能说明）
- 示例代码（列表、表单、详情、Tab详情）
- API文档（属性说明表格）

## 样式规范

- 使用 CSS Modules（`*.module.scss`）
- 遵循 BEM 命名规范
- 响应式设计支持

## 技术栈

- React 18+
- React Router v6
- Ant Design 5.x
- @kne/remote-loader（远程模块加载）
- @kne/react-intl（国际化）
- @kne/react-fetch（数据请求）
- @kne/app-children-router（路由组件）

## 生成要求

1. 完整实现上述目录结构
2. 所有组件使用 `createWithRemoteLoader` 加载依赖
3. 所有组件使用 `withLocale` HOC进行国际化封装
4. 实现完整的CRUD功能
5. 提供完整的国际化文件（中英文）
6. 提供完整的文档示例
7. 代码风格统一，使用ESLint
8. 注释清晰，易于维护
9. 支持响应式设计
10. 提供类型定义（TypeScript项目）

## 上下文信息

生成模块时需要提供：

- 模块名称（ModuleName）
- 业务字段定义
- API接口路径
- 特殊业务逻辑说明
- 列表列配置要求
- 表单字段配置要求
- 详情页展示要求
- Tab页配置要求（如需要）
