const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const getItemExtra = (columns, item) => {
  const column = (columns || []).find(col => col.name === 'options' || col.renderType === 'options');
  const value = typeof column?.getValueOf === 'function' ? column.getValueOf(item, { place: 'end' }) : null;
  return value?.children || null;
};

const renderRoleCard = ({ dataSource = [], columns, renderToolbar }) => (
  <div>
    {typeof renderToolbar === 'function' ? renderToolbar() : null}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {dataSource.map(item => (
        <div
          key={item.id}
          style={{
            border: '1px solid #eef0f3',
            borderRadius: 12,
            padding: 16,
            background: '#fff'
          }}
        >
          <div style={{ fontWeight: 600 }}>{item.name}</div>
          <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
            {item.code} · {item.description}
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #f0f0f0' }}>{getItemExtra(columns, item)}</div>
        </div>
      ))}
    </div>
  </div>
);

const roleList = [
  {
    id: 1,
    name: '系统管理员',
    code: 'admin',
    status: 'open',
    updatedAt: '2025-03-15 09:30:00',
    description: '拥有系统所有权限，可进行系统配置和用户管理'
  },
  {
    id: 2,
    name: '部门经理',
    code: 'manager',
    status: 'open',
    updatedAt: '2025-06-20 14:15:00',
    description: '管理本部门人员和项目，审批部门内事务'
  },
  {
    id: 3,
    name: '普通员工',
    code: 'employee',
    status: 'closed',
    updatedAt: '2025-01-08 11:00:00',
    description: '基础访问权限，可查看和编辑个人相关数据'
  },
  {
    id: 4,
    name: '访客',
    code: 'guest',
    status: 'open',
    updatedAt: '2025-08-01 16:45:00',
    description: '只读权限，仅可查看公开信息'
  }
];

const BaseNextExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Layout] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;
  const { message } = antd;

  const statusMap = {
    open: { type: 'success', text: '已启用' },
    closed: { type: 'default', text: '已禁用' }
  };

  const getColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
    { name: 'name', title: '角色名称', width: 160, renderType: 'main' },
    { name: 'code', title: '角色编码', width: 140 },
    {
      name: 'status',
      title: '状态',
      width: 100,
      renderType: 'tag',
      getValueOf: item => statusMap[item.status] || { type: 'default', text: item.status }
    },
    { name: 'updatedAt', title: '更新时间', width: 170, format: 'datetime' },
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

  const apis = {
    list: { loader: () => Promise.resolve({ pageData: roleList, totalCount: roleList.length }) },
    create: ({ formData }) => ({
      loader: () => Promise.resolve({ code: 0, data: { id: Date.now(), ...formData } })
    }),
    save: ({ formData, data }) => ({
      loader: () => Promise.resolve({ code: 0, data: { ...formData, id: data.id } })
    }),
    remove: ({ data }) => ({
      loader: () => Promise.resolve({ code: 0, data: { id: data.id } })
    }),
    setStatus: ({ data }) => ({
      loader: () => Promise.resolve({ code: 0, data: { id: data.id } })
    })
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { role: apis } }}>
      <Layout navigation={{ isFixed: false }}>
        <BizUnit
          isNext
          name="role-list"
          page={{ title: '角色管理' }}
          apis={apis}
          getColumns={getColumns}
          getFormInner={getFormInner}
          onMount={() => message.info('角色列表已加载')}
          options={{
            bizName: '角色',
            keywordFilterName: 'name',
            keywordFilterLabel: '角色名称',
            createButtonProps: { children: '新建角色', type: 'primary' },
            editButtonProps: { children: '编辑' },
            removeButtonProps: { children: '删除' },
            removeMessage: '删除后该角色下的用户将失去对应权限，确定继续？',
            tableProps: {
              renderMobile: renderRoleCard,
              renderCard: renderRoleCard
            }
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<BaseNextExample />);
