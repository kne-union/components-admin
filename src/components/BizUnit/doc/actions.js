const { default: BizUnit, Actions } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Flex, Tag } = antd;

const ActionsExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo', 'components-core:ButtonGroup']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, ButtonGroup] = remoteModules;

  const activeData = { id: 1, name: '系统管理员', code: 'admin', type: 'custom', status: 'open' };
  const closedData = { id: 2, name: '已禁用角色', code: 'disabled-role', type: 'custom', status: 'closed' };

  const mockApis = {
    save: { loader: () => ({ code: 0 }) },
    remove: { loader: () => ({ code: 0 }) },
    setStatus: { loader: () => ({ code: 0 }) }
  };

  const mockOptions = {
    bizName: '角色',
    openStatus: 'open',
    closedStatus: 'closed',
    editButtonProps: { children: '编辑' },
    removeButtonProps: { children: '删除' },
    removeMessage: '确定删除该角色？'
  };

  const mockGetFormInner = () => (
    <FormInfo
      column={1}
      list={[<FormInfo.fields.Input name="name" label="角色名称" rule="REQ LEN-2-50" />]}
    />
  );

  const getActionList = ({ data, ...props }) => [
    {
      ...props,
      name: 'customView',
      children: '查看权限',
      onClick: () => console.log('查看权限', data.code)
    }
  ];

  return (
    <PureGlobal preset={preset}>
      <Flex vertical gap={20}>
        <div>Actions 可脱离 BizUnit 单独使用，适用于自定义表格或详情页操作区：</div>

        <Flex vertical gap={8}>
          <Tag>默认渲染（moreType=&quot;link&quot;）</Tag>
          <Actions
            moreType="link"
            data={activeData}
            apis={mockApis}
            options={mockOptions}
            getFormInner={mockGetFormInner}
            onSuccess={() => console.log('操作成功，刷新列表')}
          />
        </Flex>

        <Flex vertical gap={8}>
          <Tag>getActionList 追加自定义按钮</Tag>
          <Actions
            moreType="link"
            data={activeData}
            apis={mockApis}
            options={mockOptions}
            getFormInner={mockGetFormInner}
            getActionList={getActionList}
            onSuccess={() => console.log('操作成功')}
          />
        </Flex>

        <Flex vertical gap={8}>
          <Tag>children 自定义按钮布局（moreType=&quot;button&quot;）</Tag>
          <Actions
            data={closedData}
            apis={mockApis}
            options={mockOptions}
            getFormInner={mockGetFormInner}
            onSuccess={() => console.log('操作成功')}
          >
            {({ list, moreType, itemClassName }) => (
              <ButtonGroup moreType="button" list={list} itemClassName={itemClassName || 'action-item'} />
            )}
          </Actions>
        </Flex>
      </Flex>
    </PureGlobal>
  );
});

render(<ActionsExample />);
