# Signature

### 概述

签名密钥管理组件，提供签名密钥的创建、验证、启用/禁用和删除功能，支持密钥列表展示和用户关联管理。


### 示例(全屏)

#### 示例代码

- 基础用法
- Signature 组件的完整功能展示，包括密钥列表、添加密钥、验证密钥、启用/禁用和删除密钥等功能
- _Signature(@components/Signature),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: Signature } = _Signature;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Signature />
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 表格列配置
- 使用 getColumns 函数获取签名列表的表格列配置，可以自定义国际化展示
- _Signature(@components/Signature),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { default: mockPreset } = _mockPreset;
const { getColumns } = _Signature;
const { createWithRemoteLoader } = remoteLoader;
const { Table } = antd;

const GetColumnsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  
  // 模拟国际化函数
  const formatMessage = ({ id }) => {
    const messages = {
      'BelongUser': '所属用户',
      'Description': '描述',
      'LastVisitedAt': '最后访问时间',
      'Status': '状态',
      'CreatedAt': '创建时间',
      'Enabled': '启用',
      'Disabled': '禁用'
    };
    return messages[id] || id;
  };

  // 获取表格列配置
  const columns = getColumns({ formatMessage });

  // 模拟数据
  const data = [
    {
      id: 1,
      appId: 'app_20240308001',
      secretKey: 'sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      user: {
        nickname: '张三',
        email: 'zhangsan@example.com',
        phone: '138****1234'
      },
      description: '用于API对接的主密钥',
      lastVisitedAt: '2024-03-08 14:30:00',
      status: 0,
      createdAt: '2024-03-01 09:00:00'
    },
    {
      id: 2,
      appId: 'app_20240305002',
      secretKey: 'sk_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4',
      user: {
        nickname: '李四',
        email: 'lisi@example.com',
        phone: '139****5678'
      },
      description: '测试环境使用的签名密钥',
      lastVisitedAt: '2024-03-05 16:20:00',
      status: 1,
      createdAt: '2024-02-28 11:00:00'
    }
  ];

  return (
    <PureGlobal preset={mockPreset}>
      <Table
        dataSource={data}
        columns={columns.map(col => ({
          ...col,
          key: col.name,
          dataIndex: col.name,
          title: col.title,
          render: col.type === 'tag' 
            ? (value, record) => {
                const tagData = col.valueOf(record, { name: col.name });
                return <span style={{ color: tagData.type === 'success' ? '#52c41a' : '#ff4d4f' }}>{tagData.text}</span>;
              }
            : col.type === 'datetime'
            ? (value) => value
            : col.type === 'other' && col.valueOf
            ? (value, record) => col.valueOf(record)
            : (value) => value
        }))}
        pagination={false}
      />
    </PureGlobal>
  );
});

render(<GetColumnsExample />);

```

### API

## Signature 组件

签名密钥管理组件，基于 BizUnit 封装，提供签名密钥的列表展示、创建、验证、启用/禁用和删除功能。

| 属性名 | 说明 | 类型 | 默认值 |
|  ---  | ---  | --- | --- |
| 无 | Signature 组件是一个完整的页面组件，不需要传入属性 | - | - |

## 功能说明

Signature 组件基于 BizUnit 实现，包含以下核心功能：

### 1. 密钥列表展示
- 显示所有签名密钥的列表
- 包含 AppId、SecretKey、所属用户、描述、最后访问时间、状态、创建时间等信息
- 支持分页展示

### 2. 添加密钥
- 选择密钥所属用户
- 填写密钥描述（最多100字符）
- 创建成功后弹窗展示 AppId 和 SecretKey，需妥善保存

### 3. 验证密钥
- 输入签名内容
- 输入时间戳（数字）
- 输入过期时间（数字）
- 验证密钥是否有效

### 4. 启用/禁用密钥
- 禁用密钥后将拒绝该密钥的所有请求
- 启用密钥后将允许该密钥访问请求

### 5. 删除密钥
- 只能删除已禁用的密钥
- 删除操作需要确认

## getColumns 函数

| 参数名 | 说明 | 类型 | 默认值 |
|  ---  | ---  | --- | --- |
| formatMessage | 国际化格式化函数 | (descriptor) => string | - |

返回值：TablePage 的 columns 配置数组

## 数据结构

### 密钥数据对象

```javascript
{
  appId: string,          // 应用ID
  secretKey: string,      // 密钥
  user: {                 // 所属用户
    id: number,
    nickname: string,
    email: string,
    phone: string
  },
  description: string,    // 描述
  lastVisitedAt: string,  // 最后访问时间
  status: number,         // 状态：0-启用，1-禁用
  createdAt: string       // 创建时间
}
```

## BizUnit 配置

Signature 组件使用以下 BizUnit 配置：

### apis 配置

| 属性名 | 说明 | 类型 |
|  ---  | ---  | --- |
| list | 列表接口配置 | Object |
| remove | 删除接口配置 | Object |
| setStatus | 状态切换接口配置 | Object |

### options 配置

| 属性名 | 说明 | 类型 | 默认值 |
|  ---  | ---  | --- | --- |
| bizName | 业务名称 | string | '密钥' |
| openStatus | 启用状态值 | number | 0 |
| closedStatus | 禁用状态值 | number | 1 |
| openButtonProps | 启用按钮属性 | Object | - |
| closeButtonProps | 禁用按钮属性 | Object | - |
| closeMessage | 禁用确认提示 | string | - |
| removeMessage | 删除确认提示 | string | - |

### 自定义操作按钮

通过 `getActionList` 自定义操作按钮：

- **验证按钮** - 自定义的验证密钥功能按钮
- **启用/禁用按钮** - 基于 BizUnit 内置的状态切换功能
- **删除按钮** - 基于 BizUnit 内置的删除功能，仅对已禁用密钥显示

## 依赖组件

Signature 组件依赖以下模块：
- `@components/BizUnit` - 业务单元组件
- `components-core:Global@usePreset` - 全局配置
- `components-core:FormInfo` - 表单组件
- `components-core:FormInfo@useFormModal` - 表单弹窗
- `components-core:InfoPage@CentralContent` - 信息展示组件

## 国际化

组件支持中英文国际化，默认语言为中文。

### 可用的国际化 key

- `AddSecretKey` - 添加密钥
- `Verify` - 验证
- `Enabled` - 启用
- `Disabled` - 禁用
- `BelongUser` - 所属用户
- `Description` - 描述
- `Status` - 状态
- `CreatedAt` - 创建时间
- `LastVisitedAt` - 最后访问时间
- `SecretKeyGenerated` - 密钥生成成功
- `SaveSecretKeyWarning` - 保存密钥警告
- `VerifySuccess` - 验证成功
- `VerifyFailed` - 验证失败
- `DisableSecretKeyMessage` - 禁用密钥确认提示
