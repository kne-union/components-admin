# UserTool

### 概述

用户工具组件，显示用户头像和名称，点击展开下拉菜单，包含用户信息、自定义操作列表和退出登录功能。适用于系统顶部导航栏的用户区域。同时提供 RightOptions 组合组件，包含语言切换和用户工具。


### 示例

#### 示例代码

- 基础用法
- 展示 UserTool 组件的基本使用方式，点击显示用户信息和操作菜单
- _UserTool(@components/UserTool),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: UserTool } = _UserTool;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  const handleEditProfile = () => {
    console.log('编辑个人资料');
  };

  const handleChangePassword = () => {
    console.log('修改密码');
  };

  return (
    <PureGlobal preset={mockPreset}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, background: '#f5f5f5' }}>
        <UserTool
          avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan"
          name="张三"
          email="zhangsan@example.com"
          list={[
            { iconType: 'icon-gerenziliao', label: '个人资料', onClick: handleEditProfile },
            { iconType: 'icon-xiugaimima', label: '修改密码', onClick: handleChangePassword }
          ]}
        />
      </div>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- 自定义子元素
- 通过 children 在下拉菜单中添加自定义内容，如升级提示、VIP 标识等
- _UserTool(@components/UserTool),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { default: UserTool } = _UserTool;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const { Button } = antd;

const WithChildrenExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  return (
    <PureGlobal preset={mockPreset}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, background: '#f5f5f5' }}>
        <UserTool
          avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=lisi"
          name="李四"
          email="lisi@tech-innovation.com"
        >
          <div style={{ padding: '8px 0' }}>
            <Button type="primary" block size="small">
              升级到专业版
            </Button>
          </div>
        </UserTool>
      </div>
    </PureGlobal>
  );
});

render(<WithChildrenExample />);

```

- 右侧选项组合
- RightOptions 组件，组合了语言切换和 UserTool，适用于顶部导航栏右侧
- _UserTool(@components/UserTool),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { RightOptions } = _UserTool;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const RightOptionsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  return (
    <PureGlobal preset={mockPreset}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, background: '#1890ff' }}>
        <RightOptions />
      </div>
    </PureGlobal>
  );
});

render(<RightOptionsExample />);

```

- 最小配置
- 仅传入头像，名称和邮箱不传或为空时显示默认文案
- _UserTool(@components/UserTool),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: UserTool } = _UserTool;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;

const MinimalExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;

  return (
    <PureGlobal preset={mockPreset}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, background: '#f5f5f5' }}>
        <UserTool
          avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu"
        />
      </div>
    </PureGlobal>
  );
});

render(<MinimalExample />);

```

### API

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |
|avatar|用户头像 URL|string|-|
|name|用户名称，不传或为空时显示"未命名"|string|-|
|email|用户邮箱|string|-|
|list|操作列表，每项包含 iconType、label、onClick|Array<{iconType: string, label: string, onClick: function}>|-|
|children|自定义子元素，显示在下拉菜单的用户信息和操作列表之间|ReactNode|-|
|storeKeys|退出登录时清除的存储 key|object|{ token: 'X-User-Token' }|
|domain|退出登录时跳转的域名|string|-|
