const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Tabs } = antd;

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

const LegacyExamples = createWithRemoteLoader({
  modules: [
    'components-core:Global@PureGlobal',
    'components-core:FormInfo',
    'components-core:Filter'
  ]
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Filter] = remoteModules;
  const { Input, TextArea, SuperSelect } = FormInfo.fields;
  const { SuperSelectFilterItem } = Filter.fields;

  const roleApis = {
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

  const customActionApis = {
    list: {
      loader: () => ({
        pageData: [
          { id: 1, name: '系统管理员', code: 'admin', type: 'system', status: 'open', description: '拥有系统所有权限' },
          { id: 2, name: '部门经理', code: 'manager', type: 'custom', status: 'open', description: '管理本部门人员' },
          { id: 3, name: '普通员工', code: 'employee', type: 'custom', status: 'closed', description: '基础访问权限' },
          { id: 4, name: '访客', code: 'guest', type: 'custom', status: 'open', description: '只读权限' }
        ],
        totalCount: 4
      })
    },
    create: { loader: () => ({ code: 0 }) },
    save: { loader: () => ({ code: 0 }) },
    remove: { loader: () => ({ code: 0 }) },
    setStatus: { loader: () => ({ code: 0 }) }
  };

  const deptApis = {
    list: {
      loader: () => ({
        pageData: [
          { id: 1, name: '技术研发部', code: 'tech', status: 'active', memberCount: 45, description: '负责产品技术研发和创新' },
          { id: 2, name: '产品设计部', code: 'design', status: 'active', memberCount: 18, description: '负责产品 UI/UX 设计' },
          { id: 3, name: '市场营销部', code: 'marketing', status: 'active', memberCount: 25, description: '负责市场推广和品牌建设' },
          { id: 4, name: '客户服务部', code: 'service', status: 'paused', memberCount: 30, description: '负责客户支持和售后服务' },
          { id: 5, name: '人力资源部', code: 'hr', status: 'active', memberCount: 12, description: '负责人才招聘和员工关系' }
        ],
        totalCount: 5
      })
    },
    create: { loader: () => ({ code: 0 }) },
    save: { loader: () => ({ code: 0 }) },
    remove: { loader: () => ({ code: 0 }) },
    setStatus: { loader: () => ({ code: 0 }) }
  };

  const projectApis = {
    list: {
      loader: () => ({
        pageData: [
          { id: 1, name: '企业官网重构', code: 'web-rebuild', status: 'active', progress: '75%', description: '全新企业官网设计与开发' },
          { id: 2, name: '移动端APP开发', code: 'mobile-app', status: 'active', progress: '45%', description: 'iOS和Android双端应用开发' },
          { id: 3, name: '数据分析平台', code: 'data-platform', status: 'paused', progress: '30%', description: '企业级数据分析与可视化平台' },
          { id: 4, name: '客户管理系统', code: 'crm', status: 'completed', progress: '100%', description: '客户关系管理系统升级' },
          { id: 5, name: '内部OA系统', code: 'oa-system', status: 'active', progress: '60%', description: '办公自动化系统建设' }
        ],
        totalCount: 5
      })
    },
    create: { loader: () => ({ code: 0 }) },
    save: { loader: () => ({ code: 0 }) },
    remove: { loader: () => ({ code: 0 }) },
    setStatus: { loader: () => ({ code: 0 }) }
  };

  const roleColumns = () => [
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

  const customActionColumns = () => [
    { name: 'id', title: 'ID', type: 'serialNumber', primary: false, hover: false },
    { name: 'name', title: '角色名称', type: 'mainInfo', primary: false, hover: false },
    { name: 'code', title: '角色编码' },
    {
      name: 'type',
      title: '类型',
      type: 'tag',
      valueOf: ({ type }) => ({
        type: type === 'system' ? 'default' : 'info',
        text: type === 'system' ? '系统' : '自定义'
      })
    },
    { name: 'description', title: '描述', type: 'description', ellipsis: true }
  ];

  const deptColumns = () => [
    { name: 'id', title: 'ID', type: 'serialNumber', primary: false, hover: false },
    { name: 'name', title: '部门名称', type: 'mainInfo', primary: false, hover: false },
    { name: 'code', title: '部门编码' },
    {
      name: 'status',
      title: '状态',
      type: 'tag',
      valueOf: ({ status }) => ({
        type: status === 'active' ? 'success' : 'warning',
        text: status === 'active' ? '运营中' : '已暂停'
      })
    },
    { name: 'memberCount', title: '成员数量' },
    { name: 'description', title: '描述', type: 'description', ellipsis: true }
  ];

  const projectColumns = () => [
    { name: 'id', title: 'ID', type: 'serialNumber', primary: false, hover: false },
    { name: 'name', title: '项目名称', type: 'mainInfo', primary: false, hover: false },
    { name: 'code', title: '项目编码' },
    {
      name: 'status',
      title: '状态',
      type: 'tag',
      valueOf: ({ status }) => {
        const statusMap = {
          active: { type: 'success', text: '进行中' },
          paused: { type: 'warning', text: '已暂停' },
          completed: { type: 'default', text: '已完成' }
        };
        return statusMap[status] || { type: 'default', text: status };
      }
    },
    { name: 'progress', title: '进度' },
    { name: 'description', title: '描述', type: 'description', ellipsis: true }
  ];

  const roleFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="角色名称" rule="REQ LEN-2-50" />,
        <Input name="code" label="角色编码" rule="REQ LEN-2-50" disabled={action === 'edit'} />,
        <TextArea name="description" label="描述" />
      ]}
    />
  );

  const deptFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="部门名称" rule="REQ LEN-2-50" />,
        <Input name="code" label="部门编码" rule="REQ LEN-2-50" disabled={action === 'edit'} />,
        <SuperSelect
          name="parentId"
          label="上级部门"
          api={{ loader: () => ({ pageData: [{ id: 1, name: '总公司' }], totalCount: 1 }) }}
          valueKey="id"
          labelKey="name"
          single
        />,
        <TextArea name="description" label="描述" />
      ]}
    />
  );

  const projectFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="项目名称" rule="REQ LEN-2-100" />,
        <Input name="code" label="项目编码" rule="REQ LEN-2-50" disabled={action === 'edit'} />,
        <TextArea name="description" label="项目描述" />
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

  const filter = [
    [
      <SuperSelectFilterItem
        name="status"
        label="状态"
        options={[
          { value: 'active', label: '运营中' },
          { value: 'paused', label: '已暂停' }
        ]}
      />,
      <SuperSelectFilterItem
        name="type"
        label="类型"
        options={[
          { value: 'tech', label: '技术部门' },
          { value: 'business', label: '业务部门' },
          { value: 'support', label: '支持部门' }
        ]}
      />
    ]
  ];

  return (
    <PureGlobal
      preset={{
        ...preset,
        apis: {
          role: roleApis,
          dept: deptApis,
          project: projectApis
        }
      }}
    >
      <Tabs
        items={[
          {
            key: 'base',
            label: '基础用法',
            children: (
              <BizUnit
                name="role-list-legacy"
                apis={roleApis}
                getColumns={roleColumns}
                getFormInner={roleFormInner}
                options={{ bizName: '角色' }}
              />
            )
          },
          {
            key: 'custom-actions',
            label: '自定义操作',
            children: (
              <BizUnit
                name="role-list-custom-actions"
                apis={customActionApis}
                getColumns={customActionColumns}
                getFormInner={roleFormInner}
                getActionList={getActionList}
                options={{ bizName: '角色' }}
              />
            )
          },
          {
            key: 'with-filter',
            label: '带筛选',
            children: (
              <BizUnit
                name="dept-list-legacy"
                apis={deptApis}
                getColumns={deptColumns}
                getFormInner={deptFormInner}
                filter={filter}
                options={{ bizName: '部门' }}
              />
            )
          },
          {
            key: 'status-control',
            label: '状态控制',
            children: (
              <BizUnit
                name="project-list-legacy"
                apis={projectApis}
                getColumns={projectColumns}
                getFormInner={projectFormInner}
                options={{
                  bizName: '项目',
                  openStatus: 'active',
                  closedStatus: 'paused',
                  openButtonProps: { children: '启动' },
                  closeButtonProps: { children: '暂停' },
                  closeMessage: '确定要暂停该项目吗？暂停后项目将停止所有自动任务。'
                }}
              />
            )
          }
        ]}
      />
    </PureGlobal>
  );
});

render(<LegacyExamples />);
