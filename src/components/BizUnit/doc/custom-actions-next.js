const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const CustomAction = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(({ remoteModules, data, ...props }) => {
  const [useModal] = remoteModules;
  const modal = useModal();
  return (
    <a
      {...props}
      onClick={() => {
        modal({
          title: '查看权限',
          size: 'small',
          children: `当前角色【${data.name}】拥有以下权限：\n- 用户管理\n- 角色管理\n- 系统设置`
        });
      }}
    >
      查看权限
    </a>
  );
});

const CustomActionsNextExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Layout] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;

  const statusMap = {
    open: { type: 'success', text: '已启用' },
    closed: { type: 'default', text: '已禁用' }
  };

  const getColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'small' },
    { name: 'name', title: '角色名称', width: 160, renderType: 'main' },
    { name: 'code', title: '角色编码', width: 140 },
    {
      name: 'type',
      title: '类型',
      width: 100,
      renderType: 'tag',
      getValueOf: item => ({
        type: item.type === 'system' ? 'default' : 'processing',
        text: item.type === 'system' ? '系统' : '自定义'
      })
    },
    {
      name: 'status',
      title: '状态',
      width: 100,
      renderType: 'tag',
      getValueOf: item => statusMap[item.status]
    },
    { name: 'description', title: '描述', width: 280, renderType: 'description', ellipsis: true }
  ];

  const getFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="角色名称" rule="REQ LEN-2-50" />,
        <Input name="code" label="角色编码" rule="REQ LEN-2-50" disabled={action === 'edit'} />,
        <TextArea name="description" label="描述" />
      ]}
    />
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
      loader: () =>
        Promise.resolve({
          pageData: [
            { id: 1, name: '系统管理员', code: 'admin', type: 'system', status: 'open', description: '拥有系统所有权限' },
            { id: 2, name: '部门经理', code: 'manager', type: 'custom', status: 'open', description: '管理本部门人员' },
            { id: 3, name: '普通员工', code: 'employee', type: 'custom', status: 'closed', description: '基础访问权限' },
            { id: 4, name: '访客', code: 'guest', type: 'custom', status: 'open', description: '只读权限' }
          ],
          totalCount: 4
        })
    },
    create: { loader: () => Promise.resolve({ code: 0 }) },
    save: { loader: () => Promise.resolve({ code: 0 }) },
    remove: { loader: () => Promise.resolve({ code: 0 }) },
    setStatus: { loader: () => Promise.resolve({ code: 0 }) }
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { role: apis } }}>
      <Layout navigation={{ isFixed: false }}>
        <BizUnit
          isNext
          name="role-list-custom-actions-next"
          page={{ title: '角色列表（自定义操作）' }}
          apis={apis}
          getColumns={getColumns}
          getFormInner={getFormInner}
          getActionList={getActionList}
          options={{ bizName: '角色' }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<CustomActionsNextExample />);
