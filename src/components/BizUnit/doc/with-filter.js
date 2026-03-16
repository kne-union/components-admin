const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const WithFilterExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo', 'components-core:Filter']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Filter] = remoteModules;
  const { Input, TextArea, SuperSelect } = FormInfo.fields;
  const { SuperSelectFilterItem } = Filter.fields;

  const getColumns = () => [
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

  const getFormInner = ({ action }) => (
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

  const filterList = [
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

  const apis = {
    list: {
      loader: () => ({
        pageData: [
          { id: 1, name: '技术研发部', code: 'tech', status: 'active', memberCount: 45, description: '负责产品技术研发和创新' },
          { id: 2, name: '产品设计部', code: 'design', status: 'active', memberCount: 18, description: '负责产品UI/UX设计' },
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

  return (
    <PureGlobal preset={{ ...preset, apis: { dept: apis } }}>
      <BizUnit
        name="dept-list"
        apis={apis}
        getColumns={getColumns}
        getFormInner={getFormInner}
        filterList={filterList}
        options={{ bizName: '部门' }}
      />
    </PureGlobal>
  );
});

render(<WithFilterExample />);
