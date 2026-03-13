# BizUnit

### 概述

BizUnit 是一个高度封装的 CRUD 业务单元组件，内置列表展示、关键字搜索、筛选、创建、编辑、删除、状态切换等完整功能。通过配置化的方式快速实现标准业务模块，支持自定义列配置、表单字段、操作按钮等，大幅提升开发效率。


### 示例

#### 示例代码

- 基础用法
- 展示 BizUnit 的基本使用方式，包含完整的 CRUD 功能：列表展示、关键字搜索、创建、编辑、删除和状态切换。通过配置 apis、getColumns、getFormInner 等属性快速实现业务模块。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useState } = React;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;
  const [refreshKey, setRefreshKey] = useState(0);

  const getColumns = () => [
    { name: 'id', title: 'ID', type: 'serialNumber', primary: false, hover: false },
    { name: 'name', title: '角色名称', type: 'mainInfo', primary: false, hover: false },
    { name: 'code', title: '角色编码' },
    { 
      name: 'status', 
      title: '状态', 
      type: 'tag',
      valueOf: ({ status }) => ({
        type: status === 'open' ? 'success' : 'default',
        text: status === 'open' ? '已启用' : '已禁用'
      })
    },
    { name: 'description', title: '描述', type: 'description', ellipsis: true }
  ];

  const getFormInner = ({ action }) => (
    <FormInfo column={1} list={[
      <Input name="name" label="角色名称" rule="REQ LEN-2-50" />,
      <Input name="code" label="角色编码" rule="REQ LEN-2-50" disabled={action === 'edit'} />,
      <TextArea name="description" label="描述" />
    ]} />
  );

  const apis = {
    list: {
      loader: () => ({
        pageData: [
          { id: 1, name: '系统管理员', code: 'admin', status: 'open', description: '拥有系统所有权限，可进行系统配置和用户管理' },
          { id: 2, name: '部门经理', code: 'manager', status: 'open', description: '管理本部门人员和项目，审批部门内事务' },
          { id: 3, name: '普通员工', code: 'employee', status: 'closed', description: '基础访问权限，可查看和编辑个人相关数据' },
          { id: 4, name: '访客', code: 'guest', status: 'open', description: '只读权限，仅可查看公开信息' }
        ],
        totalCount: 4
      })
    },
    create: { loader: () => ({ code: 0, data: { id: Date.now() } }) },
    save: { loader: () => ({ code: 0 }) },
    remove: { loader: () => ({ code: 0 }) },
    setStatus: { loader: () => ({ code: 0 }) }
  };

  return (
    <PureGlobal preset={{
      ...preset,
      apis: {
        role: apis
      }
    }}>
      <BizUnit
        key={refreshKey}
        name="role-list"
        apis={apis}
        getColumns={getColumns}
        getFormInner={getFormInner}
        options={{ bizName: '角色' }}
      />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 自定义操作按钮
- 通过 getActionList 函数自定义操作按钮。支持重置内置按钮配置（如根据条件隐藏系统类型角色的删除按钮），以及添加自定义操作按钮组件。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const CustomAction = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(({ remoteModules, data, ...props }) => {
  const [useModal] = remoteModules;
  const modal = useModal();
  return (
    <a {...props} onClick={() => {
      modal({
        title: '查看权限',
        size: 'small',
        children: &#96;当前角色【${data.name}】拥有以下权限：\n- 用户管理\n- 角色管理\n- 系统设置&#96;
      });
    }}>
      查看权限
    </a>
  );
});

const CustomActionsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;

  const getColumns = () => [
    { name: 'id', title: 'ID', type: 'serialNumber', primary: false, hover: false },
    { name: 'name', title: '角色名称', type: 'mainInfo', primary: false, hover: false },
    { name: 'code', title: '角色编码' },
    {
      name: 'type',
      title: '类型',
      type: 'tag',
      valueOf: ({ type }) => ({
        type: type === 'system' ? 'default' : 'info',
        text: type === 'system' ? '系统' : '自定义'
      })
    },
    { name: 'description', title: '描述', type: 'description', ellipsis: true }
  ];

  const getFormInner = ({ action }) => (
    <FormInfo column={1} list={[
      <Input name="name" label="角色名称" rule="REQ LEN-2-50" />,
      <Input name="code" label="角色编码" rule="REQ LEN-2-50" disabled={action === 'edit'} />,
      <TextArea name="description" label="描述" />
    ]} />
  );

  const getActionList = ({ data, ...props }) => {
    return ['remove', 'setStatusOpen', 'setStatusClose', 'save']
      .map(name => ({
        name,
        reset: ({ hidden }) => ({ name, hidden: hidden || data.type === 'system' })
      }))
      .concat([
        {
          ...props,
          buttonComponent: CustomAction,
          data,
          hidden: data.code === 'admin'
        }
      ]);
  };

  const apis = {
    list: {
      loader: () => ({
        pageData: [
          { id: 1, name: '系统管理员', code: 'admin', type: 'system', status: 'open', description: '拥有系统所有权限' },
          { id: 2, name: '部门经理', code: 'manager', type: 'custom', status: 'open', description: '管理本部门人员' },
          { id: 3, name: '普通员工', code: 'employee', type: 'custom', status: 'closed', description: '基础访问权限' },
          { id: 4, name: '访客', code: 'guest', type: 'custom', status: 'open', description: '只读权限' }
        ],
        totalCount: 4
      })
    },
    create: { loader: () => ({ code: 0 }) },
    save: { loader: () => ({ code: 0 }) },
    remove: { loader: () => ({ code: 0 }) },
    setStatus: { loader: () => ({ code: 0 }) }
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { role: apis } }}>
      <BizUnit
        name="role-list"
        apis={apis}
        getColumns={getColumns}
        getFormInner={getFormInner}
        getActionList={getActionList}
        options={{ bizName: '角色' }}
      />
    </PureGlobal>
  );
});

render(<CustomActionsExample />);

```

- 带筛选条件
- 通过 filterList 属性添加筛选条件，配合 Filter 组件的 SelectItem 实现下拉筛选。适用于需要多条件筛选的业务场景。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const WithFilterExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo', 'components-core:Filter']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Filter] = remoteModules;
  const { Input, TextArea, SuperSelect } = FormInfo.fields;
  const { SuperSelectFilterItem } = Filter.fields;

  const getColumns = () => [
    { name: 'id', title: 'ID', type: 'serialNumber', primary: false, hover: false },
    { name: 'name', title: '部门名称', type: 'mainInfo', primary: false, hover: false },
    { name: 'code', title: '部门编码' },
    {
      name: 'status',
      title: '状态',
      type: 'tag',
      valueOf: ({ status }) => ({
        type: status === 'active' ? 'success' : 'warning',
        text: status === 'active' ? '运营中' : '已暂停'
      })
    },
    { name: 'memberCount', title: '成员数量' },
    { name: 'description', title: '描述', type: 'description', ellipsis: true }
  ];

  const getFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="部门名称" rule="REQ LEN-2-50" />,
        <Input name="code" label="部门编码" rule="REQ LEN-2-50" disabled={action === 'edit'} />,
        <SuperSelect
          name="parentId"
          label="上级部门"
          api={{ loader: () => ({ pageData: [{ id: 1, name: '总公司' }], totalCount: 1 }) }}
          valueKey="id"
          labelKey="name"
          single
        />,
        <TextArea name="description" label="描述" />
      ]}
    />
  );

  const filterList = [
    [
      <SuperSelectFilterItem
        name="status"
        label="状态"
        options={[
          { value: 'active', label: '运营中' },
          { value: 'paused', label: '已暂停' }
        ]}
      />,
      <SuperSelectFilterItem
        name="type"
        label="类型"
        options={[
          { value: 'tech', label: '技术部门' },
          { value: 'business', label: '业务部门' },
          { value: 'support', label: '支持部门' }
        ]}
      />
    ]
  ];

  const apis = {
    list: {
      loader: () => ({
        pageData: [
          { id: 1, name: '技术研发部', code: 'tech', status: 'active', memberCount: 45, description: '负责产品技术研发和创新' },
          { id: 2, name: '产品设计部', code: 'design', status: 'active', memberCount: 18, description: '负责产品UI/UX设计' },
          { id: 3, name: '市场营销部', code: 'marketing', status: 'active', memberCount: 25, description: '负责市场推广和品牌建设' },
          { id: 4, name: '客户服务部', code: 'service', status: 'paused', memberCount: 30, description: '负责客户支持和售后服务' },
          { id: 5, name: '人力资源部', code: 'hr', status: 'active', memberCount: 12, description: '负责人才招聘和员工关系' }
        ],
        totalCount: 5
      })
    },
    create: { loader: () => ({ code: 0 }) },
    save: { loader: () => ({ code: 0 }) },
    remove: { loader: () => ({ code: 0 }) },
    setStatus: { loader: () => ({ code: 0 }) }
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { dept: apis } }}>
      <BizUnit
        name="dept-list"
        apis={apis}
        getColumns={getColumns}
        getFormInner={getFormInner}
        filterList={filterList}
        options={{ bizName: '部门' }}
      />
    </PureGlobal>
  );
});

render(<WithFilterExample />);

```

- 状态控制配置
- 通过 options 配置自定义状态控制按钮。支持自定义状态值、按钮文案和确认提示信息，适用于不同业务场景的状态管理。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const StatusControlExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;

  const getColumns = () => [
    { name: 'id', title: 'ID', type: 'serialNumber', primary: false, hover: false },
    { name: 'name', title: '项目名称', type: 'mainInfo', primary: false, hover: false },
    { name: 'code', title: '项目编码' },
    {
      name: 'status',
      title: '状态',
      type: 'tag',
      valueOf: ({ status }) => {
        const statusMap = {
          active: { type: 'success', text: '进行中' },
          paused: { type: 'warning', text: '已暂停' },
          completed: { type: 'default', text: '已完成' }
        };
        return statusMap[status] || { type: 'default', text: status };
      }
    },
    { name: 'progress', title: '进度' },
    { name: 'description', title: '描述', type: 'description', ellipsis: true }
  ];

  const getFormInner = ({ action }) => (
    <FormInfo column={1} list={[
      <Input name="name" label="项目名称" rule="REQ LEN-2-100" />,
      <Input name="code" label="项目编码" rule="REQ LEN-2-50" disabled={action === 'edit'} />,
      <TextArea name="description" label="项目描述" />
    ]} />
  );

  const apis = {
    list: {
      loader: () => ({
        pageData: [
          { id: 1, name: '企业官网重构', code: 'web-rebuild', status: 'active', progress: '75%', description: '全新企业官网设计与开发' },
          { id: 2, name: '移动端APP开发', code: 'mobile-app', status: 'active', progress: '45%', description: 'iOS和Android双端应用开发' },
          { id: 3, name: '数据分析平台', code: 'data-platform', status: 'paused', progress: '30%', description: '企业级数据分析与可视化平台' },
          { id: 4, name: '客户管理系统', code: 'crm', status: 'completed', progress: '100%', description: '客户关系管理系统升级' },
          { id: 5, name: '内部OA系统', code: 'oa-system', status: 'active', progress: '60%', description: '办公自动化系统建设' }
        ],
        totalCount: 5
      })
    },
    create: { loader: () => ({ code: 0 }) },
    save: { loader: () => ({ code: 0 }) },
    remove: { loader: () => ({ code: 0 }) },
    setStatus: {
      loader: () => ({ code: 0 })
    }
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { project: apis } }}>
      <BizUnit
        name="project-list"
        apis={apis}
        getColumns={getColumns}
        getFormInner={getFormInner}
        options={{
          bizName: '项目',
          openStatus: 'active',
          closedStatus: 'paused',
          openButtonProps: { children: '启动' },
          closeButtonProps: { children: '暂停' },
          closeMessage: '确定要暂停该项目吗？暂停后项目将停止所有自动任务。'
        }}
      />
    </PureGlobal>
  );
});

render(<StatusControlExample />);

```

- Actions 组件单独使用
- Actions 组件可以单独使用，用于自定义场景下的操作按钮区域。需要包裹 PureGlobal 提供国际化上下文。展示如何在不使用 BizUnit 完整功能时，单独使用操作按钮组件。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { default: BizUnit, Actions } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Flex, Tag } = antd;

// Actions 组件单独使用示例
const ActionsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo] = remoteModules;
  
  const mockData = { id: 1, name: '测试角色', status: 'open' };
  
  const mockApis = {
    save: { loader: () => ({ code: 0 }) },
    remove: { loader: () => ({ code: 0 }) },
    setStatus: { loader: () => ({ code: 0 }) }
  };

  const mockOptions = {
    bizName: '角色',
    openStatus: 'open',
    closedStatus: 'closed'
  };

  const mockGetFormInner = () => (
    <FormInfo column={1} list={[
      <FormInfo.fields.Input name="name" label="名称" rule="REQ" />
    ]} />
  );

  return (
    <PureGlobal preset={preset}>
      <Flex vertical gap={16}>
        <div>Actions 组件可以单独使用，用于自定义操作按钮区域：</div>
        <Flex gap={8} align="center">
          <Tag>操作示例：</Tag>
          <Actions
            moreType="link"
            data={mockData}
            apis={mockApis}
            options={mockOptions}
            getFormInner={mockGetFormInner}
            onSuccess={() => console.log('操作成功')}
          />
        </Flex>
        <Flex gap={8} align="center">
          <Tag>已关闭状态：</Tag>
          <Actions
            moreType="link"
            data={{ id: 2, name: '已禁用角色', status: 'closed' }}
            apis={mockApis}
            options={mockOptions}
            getFormInner={mockGetFormInner}
            onSuccess={() => console.log('操作成功')}
          />
        </Flex>
      </Flex>
    </PureGlobal>
  );
});

render(<ActionsExample />);

```

### API

# BizUnit API 文档

## BizUnit 主组件

高度封装的 CRUD 业务单元组件，内置列表、搜索、筛选、创建、编辑、删除、状态切换等功能。

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| apis | API配置对象 | Object | {} |
| getColumns | 列配置函数，返回列数组 | Function | - |
| getFormInner | 表单内容函数，返回表单JSX | Function | - |
| getActionList | 操作列表函数，用于自定义操作按钮 | Function | - |
| name | 表格名称（用于缓存等） | String | - |
| options | 配置选项 | Object | {} |
| filterList | 筛选列表配置 | Array | [] |
| allowKeywordSearch | 是否允许关键字搜索 | Boolean | true |
| topOptionsSize | 顶部操作按钮尺寸 | String | - |
| titleExtra | 标题额外内容 | ReactNode | null |
| children | 自定义渲染函数 | Function | - |
| onMount | 组件挂载回调 | Function | - |

### apis 配置

| 属性名 | 说明 | 类型 |
| --- | --- | --- |
| list | 列表接口配置 | Object/Function |
| create | 创建接口配置 | Object/Function |
| save | 编辑保存接口配置 | Object/Function |
| remove | 删除接口配置 | Object/Function |
| setStatus | 状态切换接口配置 | Object/Function |

### options 配置

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bizName | 业务名称（用于国际化提示） | String | '' |
| createButtonProps | 创建按钮属性 | Object | { children: '添加', type: 'primary' } |
| editButtonProps | 编辑按钮属性 | Object | { children: '编辑' } |
| removeButtonProps | 删除按钮属性 | Object | { children: '删除' } |
| openButtonProps | 开启按钮属性 | Object | { children: '开启' } |
| closeButtonProps | 关闭按钮属性 | Object | { children: '关闭' } |
| tableProps | 表格属性 | Object | { pagination: { paramsType: 'params' } } |
| keywordFilterName | 关键字筛选字段名 | String | 'keyword' |
| keywordFilterLabel | 关键字筛选标签 | String | '关键字' |
| formSize | 表单弹窗尺寸 | String | 'small' |
| formProps | 表单属性 | Object/Function | - |
| formModalProps | 表单弹窗属性 | Object | - |
| createFormModalProps | 创建表单弹窗属性 | Object | - |
| editFormModalProps | 编辑表单弹窗属性 | Object | - |
| openStatus | 开启状态值 | String | 'open' |
| closedStatus | 关闭状态值 | String | 'closed' |
| removeMessage | 删除确认提示信息 | String | - |
| closeMessage | 关闭确认提示信息 | String | - |
| saveData | 编辑时数据处理函数 | Function | - |
| getFilterValue | 筛选值转换函数 | Function | - |

### getColumns 函数

返回列配置数组，常用列类型：

| 类型 | 说明 | 特殊配置 |
| --- | --- | --- |
| serialNumber | 序号列 | primary, hover |
| mainInfo | 主信息列 | primary, hover |
| tag | 标签列 | valueOf 返回 { type, text } |
| description | 描述列 | ellipsis |
| avatar | 头像列 | valueOf 返回 { id } |
| datetime | 日期时间列 | format |
| other | 其他普通列 | - |

### getFormInner 函数

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| action | 操作类型 | 'create' \| 'edit' |
| apis | API配置对象 | Object |
| options | 配置选项 | Object |

### getActionList 函数

返回操作按钮数组，支持以下格式：

```javascript
// 使用内置按钮
{ name: 'remove', reset: (config) => ({ ...config, hidden: true }) }

// 自定义按钮
{ buttonComponent: CustomComponent, children: '按钮文字', hidden: false }
```

**内置按钮名称：**
- `remove` - 删除按钮
- `save` - 编辑按钮
- `setStatusOpen` - 开启按钮
- `setStatusClose` - 关闭按钮

---

## Actions 子组件

操作按钮组件，用于自定义表格操作列。

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| moreType | 更多按钮类型 | String | 'link' |
| itemClassName | 按钮项样式类名 | String | - |
| getActionList | 操作列表函数 | Function | - |
| getFormInner | 表单内容函数 | Function | - |
| data | 当前行数据 | Object | - |
| apis | API配置对象 | Object | - |
| options | 配置选项 | Object | - |
| onSuccess | 操作成功回调 | Function | - |
| children | 自定义渲染函数 | Function | - |

---

## TablePageRender 子组件

表格页面渲染组件，用于页面级别的表格展示。

### 属性

| 属性名 | 说明 | 类型 |
| --- | --- | --- |
| filter | 筛选配置 | Object |
| titleExtra | 标题额外内容 | ReactNode |
| tableOptions | 表格配置 | Object |
