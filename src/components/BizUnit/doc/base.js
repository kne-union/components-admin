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
