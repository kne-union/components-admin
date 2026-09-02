# UserSelect

### 概述

用户选择组件，用于在表单中选择用户。支持单选和多选模式，支持按用户状态筛选，支持搜索用户。基于 SuperSelectUser 封装，自动处理用户数据的转换和加载。


### 示例

#### 示例代码

- 基础用法
- 展示 UserSelect 组件的基本使用方式，支持搜索和选择用户
- _UserSelect(@components/UserSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: UserSelect } = _UserSelect;
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
          title="用户选择示例"
          column={1}
          list={[
            <Input name="projectName" label="项目名称" rule="REQ" placeholder="请输入项目名称" />
          ]}
        />
        <UserSelect
          name="userId"
          label="负责人"
          rule="REQ"
          placeholder="请选择负责人"
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

- 多选模式
- 展示 UserSelect 的多选模式，适用于选择多个用户的场景
- _UserSelect(@components/UserSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: UserSelect } = _UserSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const MultipleExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, CancelButton } = FormInfo;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="团队成员选择"
          column={1}
        />
        <UserSelect
          name="memberIds"
          label="团队成员"
          rule="REQ"
          placeholder="请选择团队成员"
          single={false}
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <CancelButton style={{ marginRight: 8 }}>取消</CancelButton>
          <SubmitButton type="primary">提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<MultipleExample />);

```

- 带初始值
- 展示 UserSelect 带初始值的使用方式，用于编辑场景
- _UserSelect(@components/UserSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: UserSelect } = _UserSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const WithInitialValueExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, CancelButton } = FormInfo;

  // 模拟编辑场景的初始数据（初始值必须包含 value 和 label）
  const initialValue = {
    projectName: '智能办公系统 V2.0',
    ownerId: { value: 2, label: '李四' },
    memberIds: [
      { value: 3, label: '王五' },
      { value: 6, label: '孙八' },
      { value: 7, label: '周九' }
    ]
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        data={initialValue}
        onSubmit={(data) => {
          console.log('提交数据:', data);
        }}
      >
        <FormInfo
          title="编辑项目"
          column={1}
        />
        <UserSelect
          name="ownerId"
          label="项目负责人"
          rule="REQ"
          placeholder="请选择项目负责人"
        />
        <UserSelect
          name="memberIds"
          label="项目成员"
          placeholder="请选择项目成员"
          single={false}
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

- 状态筛选
- 通过 status 参数筛选用户，可设置只显示特定状态的用户
- _UserSelect(@components/UserSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { default: UserSelect } = _UserSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const { Space } = antd;

const StatusFilterExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;

  return (
    <PureGlobal preset={mockPreset}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Form
          onSubmit={(data) => {
            console.log('活跃用户:', data);
          }}
        >
          <FormInfo title="仅选择活跃用户" column={1} />
          <UserSelect
            name="activeUserId"
            label="活跃用户"
            placeholder="仅显示状态正常的用户"
            status={0}
          />
          <div style={{ marginTop: 16 }}>
            <SubmitButton size="small" type="primary">确认</SubmitButton>
          </div>
        </Form>

        <Form
          onSubmit={(data) => {
            console.log('全部用户:', data);
          }}
        >
          <FormInfo title="选择全部用户（不限状态）" column={1} />
          <UserSelect
            name="allUserId"
            label="全部用户"
            placeholder="显示所有状态的用户"
            status={null}
          />
          <div style={{ marginTop: 16 }}>
            <SubmitButton size="small" type="primary">确认</SubmitButton>
          </div>
        </Form>
      </Space>
    </PureGlobal>
  );
});

render(<StatusFilterExample />);

```

- 只读模式
- 展示 UserSelect 的只读模式，适用于查看场景
- _UserSelect(@components/UserSelect),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: UserSelect } = _UserSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const ReadonlyExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form } = FormInfo;

  // 模拟只读场景的初始数据（初始值必须包含 value 和 label）
  const initialValue = {
    projectName: '企业协同平台',
    ownerId: { value: 1, label: '张三' },
    memberIds: [
      { value: 2, label: '李四' },
      { value: 3, label: '王五' },
      { value: 6, label: '孙八' }
    ]
  };

  return (
    <PureGlobal preset={mockPreset}>
      <Form data={initialValue}>
        <FormInfo
          title="项目详情（只读）"
          column={1}
        />
        <UserSelect
          name="ownerId"
          label="项目负责人"
          disabled
        />
        <UserSelect
          name="memberIds"
          label="项目成员"
          disabled
          single={false}
        />
      </Form>
    </PureGlobal>
  );
});

render(<ReadonlyExample />);

```

### API

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
