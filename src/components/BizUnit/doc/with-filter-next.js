const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const employeeList = [
  {
    id: 1,
    name: '张明',
    employeeNo: 'E2024001',
    department: 'tech',
    status: 'active',
    hireDate: '2022-03-15',
    phone: '13800138001',
    description: '高级前端工程师，负责核心业务模块开发'
  },
  {
    id: 2,
    name: '李芳',
    employeeNo: 'E2024002',
    department: 'design',
    status: 'active',
    hireDate: '2023-06-01',
    phone: '13800138002',
    description: 'UI 设计师，主导产品设计规范制定'
  },
  {
    id: 3,
    name: '王强',
    employeeNo: 'E2024003',
    department: 'marketing',
    status: 'leave',
    hireDate: '2021-09-10',
    phone: '13800138003',
    description: '市场经理，负责华东区域品牌推广'
  },
  {
    id: 4,
    name: '赵雪',
    employeeNo: 'E2024004',
    department: 'tech',
    status: 'active',
    hireDate: '2024-01-20',
    phone: '13800138004',
    description: '后端工程师，负责 API 网关与微服务架构'
  }
];

const WithFilterNextExample = createWithRemoteLoader({
  modules: [
    'components-core:Global@PureGlobal',
    'components-core:FormInfo',
    'components-core:Filter',
    'components-core:Layout',
    'components-core:TablePage@Table'
  ]
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Filter, Layout, Table] = remoteModules;
  const { Input, TextArea, SuperSelect } = FormInfo.fields;
  const { InputFilterItem, SuperSelectFilterItem, DateRangeFilterItem } = Filter.fields;
  const { message } = antd;
  const { selectedRows, getRowSelection } = Table.useSelectedRow({ rowKey: 'id' });

  const statusMap = {
    active: { type: 'success', text: '在职' },
    leave: { type: 'warning', text: '离职' }
  };

  const departmentMap = {
    tech: '技术研发部',
    design: '产品设计部',
    marketing: '市场营销部'
  };

  const getColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
    { name: 'name', title: '姓名', width: 120, renderType: 'main' },
    { name: 'employeeNo', title: '工号', width: 120 },
    {
      name: 'department',
      title: '部门',
      width: 130,
      renderType: 'tag',
      getValueOf: item => ({ type: 'processing', text: departmentMap[item.department] || item.department })
    },
    {
      name: 'status',
      title: '状态',
      width: 90,
      renderType: 'tag',
      getValueOf: item => statusMap[item.status]
    },
    { name: 'hireDate', title: '入职日期', width: 120, format: 'date' },
    { name: 'phone', title: '联系电话', width: 130 },
    { name: 'description', title: '备注', width: 240, renderType: 'description', ellipsis: true }
  ];

  const getFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="姓名" rule="REQ LEN-2-20" />,
        <Input name="employeeNo" label="工号" rule="REQ LEN-2-20" disabled={action === 'edit'} />,
        <SuperSelect
          name="department"
          label="部门"
          single
          options={[
            { value: 'tech', label: '技术研发部' },
            { value: 'design', label: '产品设计部' },
            { value: 'marketing', label: '市场营销部' }
          ]}
        />,
        <Input name="phone" label="联系电话" rule="LEN-0-20" />,
        <TextArea name="description" label="备注" />
      ]}
    />
  );

  const apis = {
    list: { loader: () => Promise.resolve({ pageData: employeeList, totalCount: employeeList.length }) },
    create: { loader: () => Promise.resolve({ code: 0 }) },
    save: { loader: () => Promise.resolve({ code: 0 }) },
    remove: { loader: () => Promise.resolve({ code: 0 }) }
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { employee: apis } }}>
      <Layout navigation={{ isFixed: false }}>
        <BizUnit
          isNext
          name="employee-list"
          page={{ title: '员工档案' }}
          apis={apis}
          getColumns={getColumns}
          getFormInner={getFormInner}
          options={{
            bizName: '员工',
            keywordFilterName: 'name',
            keywordFilterLabel: '姓名',
            mapFilterValue: (value, getFilterValue) => {
              const filter = getFilterValue(value);
              if (filter.hireDate?.length === 2) {
                return { ...filter, hireDateStart: filter.hireDate[0], hireDateEnd: filter.hireDate[1], hireDate: undefined };
              }
              return filter;
            },
            tableProps: {
              rowKey: 'id',
              rowSelection: getRowSelection(employeeList),
              selectedRows,
              pagination: { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
              batchActions: [
                {
                  key: 'export',
                  label: '批量导出',
                  onClick: ({ selectedRowKeys }) => message.info(`正在导出 ${selectedRowKeys.length} 名员工档案`)
                },
                {
                  key: 'notify',
                  label: '批量通知',
                  onClick: ({ selectedRowKeys }) => message.success(`已向 ${selectedRowKeys.length} 名员工发送通知`)
                }
              ]
            }
          }}
          filter={{
            list: [
              {
                type: InputFilterItem,
                props: { name: 'employeeNo', label: '工号' }
              },
              {
                type: SuperSelectFilterItem,
                props: {
                  name: 'department',
                  label: '部门',
                  single: true,
                  options: [
                    { value: 'tech', label: '技术研发部' },
                    { value: 'design', label: '产品设计部' },
                    { value: 'marketing', label: '市场营销部' }
                  ]
                }
              },
              {
                type: SuperSelectFilterItem,
                props: {
                  name: 'status',
                  label: '状态',
                  single: true,
                  options: [
                    { value: 'active', label: '在职' },
                    { value: 'leave', label: '离职' }
                  ]
                }
              },
              {
                type: DateRangeFilterItem,
                props: { name: 'hireDate', label: '入职日期' }
              }
            ]
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<WithFilterNextExample />);
