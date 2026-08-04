# BizUnit 使用指南

> **文档定位**：从「创建一个业务模块」的角度，指导 AI Agent 使用 `components-admin:BizUnit` 搭建标准 CRUD 列表页业务模块，并说明 BizUnit 与项目内其他模块（FormInfo、Filter、TablePage、Layout、Global、路由、国际化等）如何协作。
>
> BizUnit 组件本身的属性、列配置、筛选、操作按钮等 API 细节见 [`src/components/BizUnit/doc/api.md`](../../src/components/BizUnit/doc/api.md)，本文不重复展开，仅聚焦于「如何把它们组装成一个完整模块」。

## 相关文档

| 文档 | 职责 |
|------|------|
| [FormInfo使用指南.md](./FormInfo使用指南.md) | 表单字段、校验规则、弹窗表单 |
| [组件示例编写提示词.md](./组件示例编写提示词.md) | Mock 数据配置、文档示例与复杂路由示例编写 |
| [BizUnit doc/api.md](../../src/components/BizUnit/doc/api.md) | BizUnit 组件 API 与 isNext 配置说明 |
| [BizUnit doc/](../../src/components/BizUnit/doc/) | 可运行示例（`base-next.js`、`with-filter-next.js` 等） |

---

## 一、BizUnit 是什么

BizUnit 是一个**配置驱动的 CRUD 业务单元组件**：传入 `apis`（接口）、`getColumns`（列定义）、`getFormInner`（表单），即可自动生成「列表 + 关键字搜索 + 筛选 + 创建/编辑/删除/状态切换」的完整列表页，操作列由组件自动追加。

**新业务模块必须使用 `isNext` 模式**（基于 `@kne/table-page` 的新版表格）。本文所有模板均基于 isNext。

---

## 二、模块协作关系

创建一个业务模块，本质是把以下模块按职责组装起来。理解它们的边界，才能正确协作。

### 2.1 协作全景

```
应用入口 (bootstrap.js / preset.js)
  └─ remoteLoaderPreset 注册远程模块源 (components-core / components-admin / ...)
  └─ PureGlobal 注入 preset (ajax / apis / enums / global)
        │
        └─ 业务模块 (你创建的 Module)
             ├─ ChildrenRouter (@kne/app-children-router) —— 多子路由组织
             ├─ withLocale (@kne/react-intl)            —— 国际化 Provider
             ├─ Layout (components-core:Layout)          —— 页面外壳（isNext 必须在 Layout 内）
             ├─ BizUnit (components-admin:BizUnit)       —— CRUD 列表页核心
             │     ├─ 内部加载 Layout@TablePage / Table@TablePage / Filter
             │     ├─ getColumns  → renderType 列渲染（tag/status/date...）
             │     ├─ getFormInner → FormInfo 表单字段
             │     ├─ filter → Filter.fields 筛选项
             │     └─ 操作列     → 内置 编辑/删除/状态切换 按钮
             └─ usePreset().apis → 获取在 getApis.js 中定义的接口配置
```

### 2.2 各模块职责与加载方式

| 模块 | 加载方式 | 职责 |
|------|----------|------|
| `components-admin:BizUnit` | `createWithRemoteLoader` 远程加载 | CRUD 列表页核心，组装表格/筛选/表单/操作 |
| `components-core:Layout` | 远程加载 | 页面外壳与导航；isNext 依赖其 `Layout@TablePage` 上下文 |
| `components-core:Filter` | 远程加载（BizUnit 内部加载，筛选项组件需自行解构） | 筛选项组件 `Filter.fields`、`SearchInput`、`useSearchParamsValue` |
| `components-core:FormInfo` | 远程加载 | 表单字段定义（`FormInfo.fields`）、表单弹窗 |
| `components-core:Global@usePreset` | 远程加载 | 获取全局 `preset`（`apis`、`ajax`、`enums`） |
| `components-core:Global@PureGlobal` | 远程加载 | 注入 `preset`（含 mock），文档示例必备 |
| `@kne/app-children-router` | **直接 import 包**（非远程） | `ChildrenRouter` 组织多子路由（模式 B/C） |
| `@kne/react-intl` | 直接 import | `createWithIntlProvider`、`useIntl` |
| `@kne/remote-loader` | 直接 import | `createWithRemoteLoader` 包装组件 |

### 2.3 关键协作约定

- **API 不硬编码**：组件内通过 `usePreset().apis` 获取接口配置，URL 统一在 `getApis.js` 维护。
- **远程模块不可通过 props 传递**：子组件需要 `FormInfo`/`Filter` 时应自行用 `createWithRemoteLoader` 加载，不要从父组件透传（见 [FormInfo使用指南.md](./FormInfo使用指南.md) 最佳实践）。
- **isNext 必须在 `Layout` 内渲染**：BizUnit isNext 依赖 `Layout.TablePage` 上下文。
- **筛选用 `filter`**：isNext 模式筛选用 `filter={{ list: [...] }}`（一维 `{ type, props }` 数组），筛选项组件从 `Filter.fields` 解构。**不要**使用 legacy 二维数组格式。

---

## 三、创建业务模块流程

### 步骤 1：需求分析与模式选型

| 模式 | 适用场景 | 结构特征 |
|------|----------|----------|
| **A 单页 BizUnit** | 单一实体、一个列表页完成 CRUD | 直接渲染一个 BizUnit |
| **B 多子模块 + 左菜单** | 多实体、左侧菜单切换 | `ChildrenRouter` + 各子模块 List，BizUnit isNext 默认渲染 `Layout@TablePage`，配合 `page.menu` |
| **C SystemLayout 综合后台** | 系统管理类，需侧栏 + 多路由 + 自定义布局 | `SystemLayout` + `ChildrenRouter` + BizUnit `children` + `TablePageRender` + `Page` |

确认：
- [ ] 实体名称与字段清单
- [ ] 是否需要筛选、自定义行操作、批量操作、状态切换、自定义布局
- [ ] API 路径与请求/响应结构（列表返回 `{ pageData, totalCount }`）

### 步骤 2：定义 API（`src/components/Apis/getApis.js`）

在 `getApis` 返回的对象中，为实体新增接口。BizUnit 至少需要 `list`、`create`、`save`、`remove`，按需补充 `setStatus`、`detail`。

```javascript
// src/components/Apis/getApis.js
const getApis = options => {
  const { prefix } = Object.assign({}, { prefix: `/api/v1` }, options);
  return {
    // ...已有实体
    myEntity: {
      list: { url: `${prefix}/my-entity/list`, method: 'GET' },
      create: { url: `${prefix}/my-entity/create`, method: 'POST' },
      save: { url: `${prefix}/my-entity/save`, method: 'POST' },
      remove: { url: `${prefix}/my-entity/remove`, method: 'POST' },
      setStatus: { url: `${prefix}/my-entity/set-status`, method: 'POST' }
    }
  };
};
```

- [ ] URL、`method` 与后端约定一致
- [ ] 列表接口返回 `{ pageData: [...], totalCount: number }`（`total` 亦可）
- [ ] 实体 key（如 `myEntity`）将作为 `usePreset().apis.myEntity` 的取值路径

### 步骤 3：配置 Mock（本地开发 / 文档示例）

在 `src/mockPreset/index.js` 中，用 `merge({}, getApis(), { ... })` 为接口补充 `loader`，覆盖真实请求。`usePreset().apis` 拿到的是合并后的结果。

```javascript
// src/mockPreset/index.js
import merge from 'lodash/merge';
import { getApis } from '@components/Apis';
import myEntityList from './my-entity-list.json';

const apis = merge({}, getApis(), {
  myEntity: {
    list: { loader: () => Promise.resolve(myEntityList) }, // 返回 { pageData, totalCount }
    create: { loader: () => ({ code: 0, data: { id: Date.now() } }) },
    save: { loader: () => ({ code: 0 }) },
    remove: { loader: () => ({ code: 0 }) },
    setStatus: { loader: () => ({ code: 0 }) }
  }
});

const preset = { ajax, apis, enums, global };
export default preset;
```

- [ ] 列表 `loader` 返回值须为 `{ pageData: [...], totalCount: number }`
- [ ] JSON 用静态路径 `import('./xxx.json')`，禁止变量拼接
- [ ] 字段名与 `getColumns` / `FormInner` 保持一致，枚举字段存编码而非文案
- [ ] 详细规范见 [组件示例编写提示词.md](./组件示例编写提示词.md) §5

### 步骤 4：创建模块骨架

```
src/components/MyModule/
├── index.js                # 模块入口
├── withLocale.js           # 国际化 Provider
├── locale/
│   ├── zh-CN.js
│   └── en-US.js
├── MyModule.js             # 模式 A：直接渲染 BizUnit
│   # 或 模式 B/C：ChildrenRouter 组织子路由
├── getColumns.js           # 列配置
├── getTableFilter.js       # 筛选配置（有筛选时）
├── FormInner/
│   └── index.js            # 表单字段
├── [SubModule/]            # 模式 B/C：各子模块独立目录
│   ├── List/index.js
│   ├── getColumns.js
│   └── FormInner/index.js
└── doc/                    # 文档示例
```

#### withLocale.js

`namespace` 格式为 `[项目远程包名]:[ModuleName]`（与 `remoteLoaderPreset` 注册的 remote 名一致，本项目为 `components-admin`）。

```javascript
import { createWithIntlProvider } from '@kne/react-intl';
import zhCN from './locale/zh-CN';
import enUS from './locale/en-US';

const withLocale = createWithIntlProvider({
  defaultLocale: 'zh-CN',
  messages: { 'zh-CN': zhCN, 'en-US': enUS },
  namespace: 'components-admin:MyModule'
});

export default withLocale;
```

#### locale/zh-CN.js

```javascript
export default {
  ModuleTitle: '我的业务',
  Name: '名称',
  Status: '状态',
  StatusActive: '启用',
  StatusInactive: '禁用',
  SearchPlaceholder: '请输入关键字'
};
```

- [ ] 列标题、按钮、提示、表单标签均走 `formatMessage({ id })`
- [ ] 中英文语言包 key 一一对应

### 步骤 5：实现列表列 — `getColumns.js`

导出函数，接收 `{ formatMessage }`，返回 isNext 列配置数组（**不含操作列**）。

```javascript
const getColumns = ({ formatMessage }) => [
  { name: 'id', title: formatMessage({ id: 'ID' }), width: 80, renderType: 'small' },
  { name: 'name', title: formatMessage({ id: 'Name' }), width: 160, renderType: 'main' },
  {
    name: 'status',
    title: formatMessage({ id: 'Status' }),
    width: 100,
    renderType: 'tag',
    getValueOf: item => ({
      type: item.status === 'active' ? 'success' : 'default',
      text: formatMessage({ id: item.status === 'active' ? 'StatusActive' : 'StatusInactive' })
    })
  },
  { name: 'description', title: formatMessage({ id: 'Description' }), renderType: 'description', ellipsis: true }
];

export default getColumns;
```

- [ ] 使用 `renderType`、`getValueOf`、`format`（isNext），不用 legacy 的 `type`、`valueOf`
- [ ] `tag`/`status` 列的 `getValueOf` 返回 `{ type, text }`
- [ ] 日期列用 `format: 'date' | 'datetime'`
- [ ] 完整列配置项见 [BizUnit doc/api.md](../../src/components/BizUnit/doc/api.md) `getColumns` 章节

### 步骤 6：实现表单 — `FormInner/index.js`

使用 `FormInfo` 及 `FormInfo.fields` 定义字段，自行远程加载 FormInfo。

```javascript
import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { Input, TextArea } = FormInfo.fields;
    const { formatMessage } = useIntl();

    return (
      <FormInfo
        title={formatMessage({ id: 'BasicInfo' })}
        column={2}
        list={[
          <Input name="name" label={formatMessage({ id: 'Name' })} rule="REQ LEN-2-50" />,
          <TextArea name="description" label={formatMessage({ id: 'Description' })} block rule="LEN-0-1000" />
        ]}
      />
    );
  })
);

export default FormInner;
```

- [ ] 字段类型与校验规则见 [FormInfo使用指南.md](./FormInfo使用指南.md)
- [ ] 文本字段建议限制长度：`Input` 用 `LEN-0-100`，`TextArea` 用 `LEN-0-1000`；必填加 `REQ`
- [ ] `getFormInner` 可接收 `{ action, apis, options }`，按 `action === 'edit'` 区分创建/编辑

### 步骤 7：实现筛选 — `getTableFilter.js`（有筛选时）

返回**一维** `{ type, props }` 数组，筛选项组件从 `Filter.fields` 解构，在 BizUnit 处用 `filter={{ list: ... }}` 传入。

```javascript
const getTableFilter = ({ formatMessage, InputFilterItem, SuperSelectFilterItem }) => [
  { type: InputFilterItem, props: { name: 'name', label: formatMessage({ id: 'Name' }) } },
  {
    type: SuperSelectFilterItem,
    props: {
      name: 'status',
      label: formatMessage({ id: 'Status' }),
      single: true,
      options: [
        { label: formatMessage({ id: 'StatusActive' }), value: 'active' },
        { label: formatMessage({ id: 'StatusInactive' }), value: 'inactive' }
      ]
    }
  }
];

export default getTableFilter;
```

- [ ] 一维数组，**禁止** legacy 二维数组，**禁止** `displayLine`
- [ ] 常用筛选项：`InputFilterItem`、`SuperSelectFilterItem`、`DateRangeFilterItem`
- [ ] 筛选项 `name` 与列表接口筛选参数一致

### 步骤 8：路由与导航注册

- [ ] 在应用路由入口为模块注册 `baseUrl` 与 `Route`
- [ ] 在导航 / 菜单配置中补充文案
- [ ] 模式 B/C：父级传入 `baseUrl`，子模块在此基础上拼接（如 `${baseUrl}/my-module`）

### 步骤 9：文档示例

- [ ] 按 [组件示例编写提示词.md](./组件示例编写提示词.md) 编写 `doc/` 示例与 `example.json`
- [ ] BizUnit 模块示例须在 `Layout` 内渲染，多路由模块用 `Routes` 包裹（示例环境已有外层 Router，勿再嵌套 `BrowserRouter`）

---

## 四、核心代码模板

### 4.1 模式 A：单页 BizUnit

```javascript
import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import getColumns from './getColumns';
import getTableFilter from './getTableFilter';
import FormInner from './FormInner';

const MyModule = createWithRemoteLoader({
  modules: [
    'components-admin:BizUnit',
    'components-core:Filter',
    'components-core:Layout',
    'components-core:Global@usePreset'
  ]
})(
  withLocale(({ remoteModules, ...props }) => {
    const [BizUnit, Filter, Layout, usePreset] = remoteModules;
    const { InputFilterItem, SuperSelectFilterItem } = Filter.fields;
    const { formatMessage } = useIntl();
    const { apis } = usePreset();

    return (
      <Layout>
        <BizUnit
          {...props}
          isNext
          name="my-module"
          page={{ title: formatMessage({ id: 'ModuleTitle' }) }}
          apis={{
            list: apis.myEntity.list,
            create: apis.myEntity.create,
            save: ({ formData, data }) =>
              Object.assign({}, apis.myEntity.save, { data: { ...formData, id: data.id } }),
            remove: ({ data }) =>
              Object.assign({}, apis.myEntity.remove, { data: { id: data.id } })
          }}
          getColumns={() => getColumns({ formatMessage })}
          getFormInner={() => <FormInner />}
          filter={{
            list: getTableFilter({ formatMessage, InputFilterItem, SuperSelectFilterItem })
          }}
          options={{
            bizName: formatMessage({ id: 'ModuleTitle' }),
            keywordFilterName: 'keyword',
            keywordFilterLabel: formatMessage({ id: 'SearchPlaceholder' })
          }}
        />
      </Layout>
    );
  })
);

export default MyModule;
```

### 4.2 模式 B：多子模块 + 左菜单

#### 入口 `index.js`（ChildrenRouter 直接 import）

```javascript
import ChildrenRouter from '@kne/app-children-router';
import withLocale from './withLocale';

const MyModuleInner = ({ baseUrl, ...props }) => {
  return (
    <ChildrenRouter
      {...props}
      baseUrl={`${baseUrl}/my-module`}
      list={[
        { index: true, loader: () => import('./SubA/List'), elementProps: { baseUrl } },
        { path: 'sub-b', loader: () => import('./SubB/List'), elementProps: { baseUrl } }
      ]}
    />
  );
};

export default withLocale(MyModuleInner);
```

#### 子模块 `SubA/List/index.js`

结构与模式 A 的 BizUnit 配置一致，`page` 可带 `menu` 实现侧栏导航。无需 `children` 时，BizUnit isNext 默认渲染 `Layout@TablePage`。

```javascript
// 关键差异：page 带 menu（侧栏），menu 由父级 Menu 组件提供
<BizUnit
  isNext
  name="sub-a-list"
  page={{ title: formatMessage({ id: 'SubATitle' }), menu }}
  apis={...}
  getColumns={() => getColumns({ formatMessage })}
  getFormInner={() => <FormInner />}
  filter={{ list: getTableFilter({ ... }) }}
  options={{ bizName: formatMessage({ id: 'SubATitle' }) }}
/>
```

### 4.3 模式 C：SystemLayout 综合后台

配合 `@kne/system-layout` 的 `SystemLayout` + `Page`，BizUnit 通过 `children` 回调 + `TablePageRender` 自定义布局。须引入 `@kne/system-layout/dist/index.css`。

```javascript
import { createWithRemoteLoader } from '@kne/remote-loader';
import SystemLayout, { Page } from '@kne/system-layout';
import '@kne/system-layout/dist/index.css';
import ChildrenRouter from '@kne/app-children-router';
import { Route, Routes, Navigate } from 'react-router-dom';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';

const MyModule = createWithRemoteLoader({
  modules: [
    'components-admin:BizUnit',
    'components-core:Global@PureGlobal',
    'components-core:Global@usePreset',
    'components-core:Filter',
    'components-core:FormInfo'
  ]
})(
  withLocale(({ remoteModules, baseUrl }) => {
    const [BizUnit, PureGlobal, usePreset, Filter, FormInfo] = remoteModules;
    const { TablePageRender } = BizUnit;
    const { formatMessage } = useIntl();
    const { apis } = usePreset();

    const renderPage = (title, renderProps) => (
      <Page title={title} extra={renderProps.titleExtra}>
        <TablePageRender {...renderProps} />
      </Page>
    );

    return (
      <PureGlobal preset={preset}>
        <SystemLayout
          userInfo={{ name: '管理员' }}
          menu={{ base: baseUrl, items: [
            { path: '/list', label: formatMessage({ id: 'ModuleTitle' }) }
          ] }}
        >
          <Routes>
            <Route
              path={`${baseUrl}/*`}
              element={
                <ChildrenRouter
                  baseUrl={baseUrl}
                  list={[
                    { index: true, element: <Navigate to="list" replace /> },
                    {
                      path: 'list',
                      element: (
                        <BizUnit
                          isNext
                          name="my-module-list"
                          apis={apis.myEntity}
                          getColumns={() => getColumns({ formatMessage })}
                          getFormInner={() => <FormInner />}
                          filter={{ list: getTableFilter({ ... }) }}
                          options={{ bizName: formatMessage({ id: 'ModuleTitle' }) }}
                        >
                          {renderProps => renderPage(formatMessage({ id: 'ModuleTitle' }), renderProps)}
                        </BizUnit>
                      )
                    }
                  ]}
                />
              }
            />
            <Route path="*" element={<Navigate to={`${baseUrl}/list`} replace />} />
          </Routes>
        </SystemLayout>
      </PureGlobal>
    );
  })
);

export default MyModule;
```

> **`children` 回调参数**：`{ isNext, filter, topOptions, titleExtra, tableOptions }`。`tableOptions` 透传给 `TablePageRender`；isNext 时 `TablePageRender` 渲染新版 `components-core:TablePage`，供 `Page` 等外层容器使用。完整说明见 [BizUnit doc/api.md](../../src/components/BizUnit/doc/api.md) `children` 章节。

---

## 五、模块协作详解

### 5.1 BizUnit ↔ Global（preset / apis）

- **应用启动时**：`bootstrap.js` 调用 `globalInit()`（`preset.js`），通过 `remoteLoaderPreset` 注册远程模块源，并准备好 `ajax`。
- **preset 注入**：`PureGlobal` 接收 `preset`（含 `apis`、`ajax`、`enums`），通过 Context 向下提供。
- **业务模块取用**：组件内 `const { apis } = usePreset()` 获取接口配置，传给 BizUnit 的 `apis` 属性。BizUnit 内部用 `ajax` 发请求。

### 5.2 BizUnit ↔ FormInfo（表单）

- BizUnit 的 `getFormInner` 返回由 `FormInfo` + `FormInfo.fields` 组成的表单 JSX。
- 创建/编辑时，BizUnit 用表单弹窗承载 `FormInner`，提交数据传给 `apis.create` / `apis.save`。
- **FormInfo 必须自行远程加载**，不可通过 props 透传。

### 5.3 BizUnit ↔ Filter（筛选）

- BizUnit 内部已加载 `Filter`，提供 `SearchInput`（关键字搜索）；配置 `searchParamsValue` 时用 `useSearchParamsValue` / TablePage `filter.searchParamsValue` 从 URL 种子化初始筛选。
- 筛选项组件（`InputFilterItem`、`SuperSelectFilterItem`、`DateRangeFilterItem`）需在业务组件中从 `Filter.fields` 解构，组装成 `filter={{ list: [...] }}` 传给 BizUnit。
- `options.mapFilterValue` 可对筛选值做二次映射（如日期区间拆为起止两个字段）。

### 5.4 BizUnit ↔ Layout / TablePage

- isNext 模式下，BizUnit 必须在 `components-core:Layout` 内渲染，依赖 `Layout.TablePage` 上下文。
- 默认渲染 `Layout@TablePage`（含权限页与表格外壳）。
- 通过 `children` + `TablePageRender` 可跳过 `Layout@TablePage` 外壳，直接渲染新版 `components-core:TablePage`，适配 `SystemLayout` / `StateBarPage` 等容器。

### 5.5 BizUnit ↔ 路由（app-children-router / system-layout）

- **单页**：直接渲染 BizUnit。
- **多子模块**：`ChildrenRouter`（`@kne/app-children-router`，直接 import）按 `baseUrl` + `path` 懒加载子模块 List。父级传入 `baseUrl`，子模块拼接自己的子路径。
- **SystemLayout**：`@kne/system-layout` 的 `SystemLayout` 提供侧栏，`Page` 承载标题与 `extra`，BizUnit `children` 回调把 `TablePageRender` 放进 `Page`。
- **示例环境 Router**：示例运行环境已提供外层 Router，仅用 `Routes`/`Route`/`Navigate`/`useSearchParams`，**禁止**再渲染 `BrowserRouter`/`MemoryRouter`。

### 5.6 BizUnit ↔ 国际化（react-intl）

- `withLocale`（`createWithIntlProvider`）为模块注入语言包，`namespace` 取 `[远程包名]:[ModuleName]`。
- `useIntl().formatMessage({ id })` 用于列标题、按钮文案、页面标题等。
- BizUnit 自身也内置 `withLocale`，默认按钮文案（添加/编辑/删除等）已国际化。

---

## 六、完整检查清单

### API 与 Mock
- [ ] `getApis.js` 新增实体接口（`list`/`create`/`save`/`remove`，按需 `setStatus`）
- [ ] 列表接口返回 `{ pageData, totalCount }`
- [ ] `mockPreset/index.js` 为新实体补充 `loader`
- [ ] 组件内通过 `usePreset().apis` 取接口，未硬编码 URL

### 模块骨架
- [ ] `withLocale.js` 的 `namespace` 为 `components-admin:ModuleName`
- [ ] `locale/zh-CN.js`、`locale/en-US.js` key 对齐
- [ ] `index.js` 导出根组件，模式 B/C 用 `ChildrenRouter`

### BizUnit 配置
- [ ] 使用 `isNext`
- [ ] 在 `Layout` 内渲染
- [ ] 用 `createWithRemoteLoader` 加载 `components-admin:BizUnit` 等远程模块
- [ ] `page={{ title }}` 设置标题
- [ ] `create`/`save` 需处理表单数据时用函数形式
- [ ] 筛选用 `filter={{ list: [...] }}`（一维数组），勿用 legacy 二维数组

### 列 / 表单 / 筛选
- [ ] `getColumns` 用 `renderType`/`getValueOf`/`format`
- [ ] `FormInner` 自行加载 `FormInfo`，字段有校验规则
- [ ] `filter` 筛选项 `name` 与接口参数一致

### 路由 / 文档
- [ ] 注册模块路由 `baseUrl` 与导航菜单
- [ ] 按 [组件示例编写提示词.md](./组件示例编写提示词.md) 编写 `doc/` 示例

---

## 七、技术栈

- React 18+ / React Router v6 / Ant Design 5.x
- `@kne/remote-loader`（远程模块加载）
- `@kne/react-intl`（国际化）
- `@kne/app-children-router`（多子路由，模式 B/C）
- `@kne/system-layout`（系统级布局，模式 C）
- `components-admin:BizUnit`（isNext）
- `components-core:FormInfo` / `Filter` / `Layout` / `TablePage` / `Global`

---

实现前须先确认当前项目的 API 定义方式（`getApis.js`）、Mock 注入方式（`mockPreset`）、路由注册位置及分页/筛选参数约定。BizUnit 属性与高级用法（自定义操作 `getActionList`、批量操作 `tableProps.rowSelection`/`batchActions`、URL 筛选 `searchParamsValue`、自定义布局 `children`）见 [BizUnit doc/api.md](../../src/components/BizUnit/doc/api.md) 及 `doc/` 示例。
