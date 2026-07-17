# GroupSelect

### 概述

分组标签选择器，以及分组工具栏（树选 + 新建/编辑/删除）与侧栏布局组件，基于 Group API。


### 示例

#### 示例代码

- 基础用法
- 展示 GroupSelect 组件的基本使用方式，支持多选、搜索、添加和删除标签
- _GroupSelect(@components/GroupSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: GroupSelect } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, CancelButton, fields } = FormInfo;
  const { Input } = fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="技能标签选择"
          column={1}
          list={[
            <Input name="name" label="项目名称" rule="REQ" placeholder="请输入项目名称" />
          ]}
        />
        <GroupSelect
          name="groups"
          label="技能标签"
          rule="REQ"
          placeholder="请选择技能标签"
          groupName="技能标签"
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <CancelButton style={{ marginRight: 8 }}>取消</CancelButton>
          <SubmitButton type="primary">提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 单选模式
- 展示 GroupSelect 的单选模式，适用于只需选择一个标签的场景
- _GroupSelect(@components/GroupSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: GroupSelect } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const SingleSelectExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, fields } = FormInfo;
  const { Input } = fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        data={{
          name: '数据分析项目',
          primaryGroup: { code: 'ai', name: '人工智能' }
        }}
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="主技能标签选择"
          column={1}
          list={[
            <Input name="name" label="项目名称" rule="REQ" placeholder="请输入项目名称" />
          ]}
        />
        <GroupSelect
          name="primaryGroup"
          label="主技能标签"
          single
          rule="REQ"
          placeholder="请选择一个主技能标签"
        />
        <div style={{ marginTop: 16 }}>
          <SubmitButton>提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<SingleSelectExample />);

```

- 带初始值
- 展示 GroupSelect 带初始值的使用方式，用于编辑场景
- _GroupSelect(@components/GroupSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: GroupSelect } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const WithInitialValueExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, CancelButton, fields } = FormInfo;
  const { Input } = fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        data={{
          name: '全栈开发项目',
          groups: [
            { code: 'frontend', name: '前端开发' },
            { code: 'backend', name: '后端开发' },
            { code: 'database', name: '数据库' }
          ]
        }}
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="编辑项目技能标签"
          column={1}
          list={[
            <Input name="name" label="项目名称" rule="REQ" placeholder="请输入项目名称" />
          ]}
        />
        <GroupSelect
          name="groups"
          label="技能标签"
          placeholder="请选择技能标签"
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <CancelButton style={{ marginRight: 8 }}>取消</CancelButton>
          <SubmitButton type="primary">保存</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<WithInitialValueExample />);

```

- 只读模式
- 不传 create 和 remove 接口时，隐藏添加和删除按钮，适用于只做选择的场景
- _GroupSelect(@components/GroupSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: GroupSelect } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset, groupList } = _mockPreset;

const ReadonlyExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, fields } = FormInfo;
  const { Input } = fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        data={{
          name: '只读项目',
          groups: [
            { code: 'frontend', name: '前端开发' },
            { code: 'backend', name: '后端开发' }
          ]
        }}
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="只读标签选择（无添加/删除功能）"
          column={1}
          list={[
            <Input name="name" label="项目名称" rule="REQ" placeholder="请输入项目名称" />
          ]}
        />
        <GroupSelect
          name="groups"
          label="技能标签"
          placeholder="请选择技能标签"
          groupName="技能标签"
          apis={{
            // 只传 list 接口，不传 create 和 remove，隐藏添加和删除按钮
            list: {
              loader: () => groupList.data
            }
          }}
        />
        <div style={{ marginTop: 16 }}>
          <SubmitButton>提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<ReadonlyExample />);

```

- 分组工具栏
- 树形选择 + 新建/编辑/删除；并排展示有父级（含 showColor 颜色选择）与无父级（showParent=false，扁平分组）
- _GroupSelect(@components/GroupSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { default: GroupSelect, GroupFolderToolbar } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const { useState } = React;
const { App } = antd;

const flatGroupApis = {
  ...mockPreset.apis.group,
  groupList: {
    loader: () => [
      { id: 1, code: 'frontend', name: '前端开发', description: '前端相关技能' },
      { id: 2, code: 'backend', name: '后端开发', description: '后端相关技能' },
      { id: 3, code: 'ai', name: '人工智能', description: 'AI 相关技能' }
    ]
  }
};

const ToolbarExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [withParent, setWithParent] = useState(null);
  const [withoutParent, setWithoutParent] = useState(null);
  const Toolbar = GroupFolderToolbar || GroupSelect.GroupFolderToolbar;

  return (
    <PureGlobal preset={mockPreset}>
      <App>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: '#666', fontWeight: 500 }}>有父级（showParent 默认 true）+ 颜色（showColor）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Toolbar
                type="skill"
                groupName="分组"
                showColor
                apis={mockPreset.apis.group}
                value={withParent}
                onChange={key => setWithParent(key)}
              />
            </div>
            <div style={{ color: '#999', fontSize: 13 }}>
              树形数据，新建/编辑表单含「父级」「颜色」字段；当前：{withParent ? String(withParent) : '全部'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: '#666', fontWeight: 500 }}>无父级（showParent=false）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Toolbar
                type="skill"
                groupName="分组"
                showParent={false}
                apis={flatGroupApis}
                value={withoutParent}
                onChange={key => setWithoutParent(key)}
              />
            </div>
            <div style={{ color: '#999', fontSize: 13 }}>
              扁平数据，新建/编辑表单不展示「父级」字段；当前：{withoutParent ? String(withoutParent) : '全部'}
            </div>
          </div>
        </div>
      </App>
    </PureGlobal>
  );
});

render(<ToolbarExample />);

```

- 分组侧栏布局
- GroupFolder 左侧树 + 右侧内容区，用于按分组筛选列表页
- _GroupSelect(@components/GroupSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { default: GroupSelect, GroupFolder } = _GroupSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const { useState } = React;
const { App, Card, Empty } = antd;

const FolderExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  const [selected, setSelected] = useState(null);
  const Folder = GroupFolder || GroupSelect.GroupFolder;

  return (
    <PureGlobal preset={mockPreset}>
      <App>
        <Folder
          type="skill"
          apis={mockPreset.apis.group}
          value={selected}
          onChange={(key, item) => {
            setSelected(key);
            console.log('选中分组:', key, item);
          }}
          style={{ minHeight: 280 }}
        >
          <Card size="small" title={selected ? &#96;当前分组：${selected}&#96; : '全部内容'}>
            <Empty description="这里放列表或详情内容，随左侧分组切换" />
          </Card>
        </Folder>
      </App>
    </PureGlobal>
  );
});

render(<FolderExample />);

```

### API

## GroupSelect 组件

分组标签选择器组件，基于 SuperSelectTableList 封装，用于选择和管理技能标签或其他分组数据，支持搜索、分页、添加和删除功能。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 字段名（必填） | string | - |
| label | 字段标签 | string \| ReactNode | - |
| rule | 校验规则 | string | - |
| type | 分组类型，透传到 list/create/save/remove/groupList | string | - |
| language | 语言，默认取全局 locale | string | - |
| apis | API 配置对象，不传则使用 `preset.apis.group` | object | - |
| apis.list | 列表查询接口 | object | - |
| apis.groupList | 分组树/列表接口（父级选择、工具栏、侧栏） | object | - |
| apis.create | 创建接口（传入则显示添加按钮） | object | - |
| apis.save | 保存/更新接口（工具栏编辑使用） | object | - |
| apis.remove | 删除接口（传入则显示删除按钮） | object | - |
| valueKey | 值字段名 | string | 'code' |
| labelKey | 标签字段名 | string | 'name' |
| single | 是否单选 | boolean | false |
| placeholder | 占位符 | string | - |
| disabled | 是否禁用 | boolean | false |
| groupName | 标签名称，用于显示添加/删除等操作文案 | string | '标签' |

## GroupFolderToolbar 组件

类似人才库「文件夹工具栏」：树形下拉选择当前分组，默认选中「全部」；选中具体分组后可编辑/删除；右侧圆形按钮新建分组。内部请求 `apis.group.groupList / create|save / remove`。

远程加载：`components-admin:GroupSelect@GroupFolderToolbar`

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 分组类型 | string | - |
| language | 语言 | string | 全局 locale |
| value / onChange | 受控选中值；`onChange(key, item)`，选「全部」时为 `(null, null)` | any / function | - |
| apis | 覆盖 `groupList` / `create` / `save` / `remove` | object | `preset.apis.group` |
| valueKey | 值字段 | string | 'code' |
| labelKey | 展示字段 | string | 'name' |
| groupName | 文案中的实体名 | string | '标签' |
| compact | 更窄的选择框 | boolean | false |
| manageable | 是否显示新建/编辑；删除还依赖 `apis.remove` | boolean | true |
| showParent | 新建/编辑表单是否展示「父级」字段；`false` 时为扁平分组 | boolean | true |
| showColor | 新建/编辑表单是否展示「颜色」字段，提交时随 `color` 字段传给 create/save；开启后已选名称前与下拉选项均按分组 `color` 显示实心文件夹图标 | boolean | false |

### 交互说明

1. 默认展示并选中「全部」，不可清空到空值
2. 选中非「全部」时，选择框右侧出现编辑、删除按钮
3. 新建/编辑弹窗字段：编码、名称、父级（可由 `showParent={false}` 关闭）、描述；编辑时编码不可改
4. 删除当前选中项后，自动回到「全部」

### 基本用法

```jsx
import { createWithRemoteLoader } from '@kne/remote-loader';

const Example = createWithRemoteLoader({
  modules: ['components-admin:GroupSelect@GroupFolderToolbar']
})(({ remoteModules }) => {
  const [GroupFolderToolbar] = remoteModules;
  const [folder, setFolder] = React.useState(null);

  return (
    <GroupFolderToolbar
      type="skill"
      groupName="分组"
      value={folder}
      onChange={(key) => setFolder(key)}
    />
  );
});
```

## GroupFolder 组件

左侧分组树 + 右侧内容区布局，适用于列表页按分组筛选。远程加载：`components-admin:GroupSelect@GroupFolder`

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 分组类型 | string | - |
| language | 语言 | string | 全局 locale |
| showRoot | 是否显示「全部」根节点 | boolean | true |
| rootTitle | 根节点文案 | string | '全部' |
| value / onChange | 受控；`onChange(key, node)`，根节点为 `(null, null)` | any / function | - |
| apis | 覆盖 `groupList` 等，默认 `preset.apis.group` | object | - |
| children | 右侧内容，或 render props：`({ treeData, selectedKeys, onChange, tree })` | ReactNode \| function | - |

### 基本用法

```jsx
<GroupFolder type="skill" value={key} onChange={setKey}>
  <List filterGroup={key} />
</GroupFolder>
```

## 功能特性（GroupSelect）

### 1. 表格列表展示
- 以表格形式展示标签列表，包含编码、名称、描述等信息
- 支持分页显示

### 2. 搜索功能
- 支持关键字搜索标签
- 实时过滤搜索结果

### 3. 添加标签
- 点击底部"添加标签"按钮可添加新标签
- 弹出表单填写编码、名称、父级、描述
- 仅当传入 `apis.create` 或全局配置 `preset.apis.group.create` 时显示

### 4. 删除标签
- 每行显示删除操作按钮
- 删除前需确认
- 如果标签已被选中，会自动从已选列表中移除
- 仅当传入 `apis.remove` 或全局配置 `preset.apis.group.remove` 时显示

### 5. 多选/单选
- 默认支持多选
- 设置 `single={true}` 切换为单选模式

## 默认 API 配置

组件默认使用 `apis.group`：

```javascript
{
  list: { /* GET 分页列表，供 GroupSelect */ },
  groupList: { /* GET 树/列表，params.output = tree|list */ },
  create: { /* POST 新建，通常与 save 同址 */ },
  save: { /* POST 新建或更新（带 id） */ },
  remove: { /* POST 删除 */ }
}
```

典型请求参数：

- `groupList`：`{ type, language, output: 'tree' | 'list' }`
- `create` / `save`：`{ type, language, code, name, parentId, description, id? }`
- `remove`：`{ id, code, type }`

需要在全局 preset 中配置，或通过 `apis` 属性传入。

## 依赖模块

- `components-core:FormInfo`
- `components-core:FormInfo@useFormModal`
- `components-core:Global@usePreset`
- `components-core:Common@SuperSelectTreeField`（工具栏选择）
