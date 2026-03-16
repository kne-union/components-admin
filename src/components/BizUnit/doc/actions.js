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
