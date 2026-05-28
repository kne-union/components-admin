const { UserList } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Flex } = antd;

/**
 * 自定义渲染示例：
 * 通过 children 函数获取 UserList 内部的 filter、tableOptions 等，
 * 自行组合布局，例如将筛选和表格嵌入到自定义页面结构中。
 */
const CustomRenderExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout', 'components-core:Table@TablePage']
})(({ remoteModules }) => {
  const [PureGlobal, Layout, TablePage] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <UserList
          apis={{
            list: mockPreset.apis.tenant.getUserList,
            roleList: mockPreset.apis.tenant.getRoleList,
            orgList: mockPreset.apis.tenant.orgList
          }}
        >
          {({ tableOptions }) => (
            <Flex vertical gap={12} flex={1}>
              <div style={{ padding: 16, background: '#f6f8fa', borderRadius: 8 }}>
                自定义区域：可以在此放置统计面板、快捷操作等内容
              </div>
              <TablePage {...tableOptions} />
            </Flex>
          )}
        </UserList>
      </Layout>
    </PureGlobal>
  );
});

render(<CustomRenderExample />);
