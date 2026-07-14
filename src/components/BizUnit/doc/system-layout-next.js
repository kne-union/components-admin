const { default: BizUnit, TablePageRender } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { default: SystemLayout, Page } = _systemLayout;
const { default: AppChildrenRouter } = appChildrenRouter;
const { Route, Routes, Navigate } = reactRouterDom;
const { Modal, message } = antd;

const baseUrl = '/biz-unit-system-layout';

const employeeList = [
  {
    id: 1,
    name: '张明',
    employeeNo: 'E2024001',
    department: '技术研发部',
    position: '高级前端工程师',
    status: 'ACTIVE',
    email: 'zhangming@yunfan.com',
    phone: '13800138001'
  },
  {
    id: 2,
    name: '李芳',
    employeeNo: 'E2024002',
    department: '产品设计部',
    position: 'UI 设计师',
    status: 'ACTIVE',
    email: 'lifang@yunfan.com',
    phone: '13800138002'
  },
  {
    id: 3,
    name: '王强',
    employeeNo: 'E2024003',
    department: '市场营销部',
    position: '市场经理',
    status: 'RESIGN',
    email: 'wangqiang@yunfan.com',
    phone: '13800138003'
  },
  {
    id: 4,
    name: '赵雪',
    employeeNo: 'E2024004',
    department: '技术研发部',
    position: '后端工程师',
    status: 'ACTIVE',
    email: 'zhaoxue@yunfan.com',
    phone: '13800138004'
  }
];

const positionList = [
  {
    id: 1,
    name: '高级前端工程师',
    status: 'published',
    description: '负责核心业务前端架构与组件库建设',
    publishAt: '2025-06-01 10:00:00',
    createdAt: '2025-05-15 09:30:00'
  },
  {
    id: 2,
    name: 'UI 设计师',
    status: 'draft',
    description: '负责产品视觉规范与交互设计',
    publishAt: null,
    createdAt: '2025-05-20 14:20:00'
  },
  {
    id: 3,
    name: '市场经理',
    status: 'published',
    description: '负责华东区域品牌推广与渠道拓展',
    publishAt: '2025-05-28 16:00:00',
    createdAt: '2025-05-10 11:00:00'
  }
];

const employeeStatusMap = {
  ACTIVE: { type: 'success', text: '在职' },
  RESIGN: { type: 'default', text: '离职' }
};

const positionStatusMap = {
  published: { type: 'success', text: '已发布' },
  draft: { type: 'default', text: '草稿' }
};

const SystemLayoutNextExample = createWithRemoteLoader({
  modules: [
    'components-core:Global@PureGlobal',
    'components-core:FormInfo',
    'components-core:Filter',
    'components-core:TablePage@Table'
  ]
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Filter, Table] = remoteModules;
  const { Input, TextArea, SuperSelect } = FormInfo.fields;
  const { InputFilterItem, SuperSelectFilterItem } = Filter.fields;
  const { selectedRows: employeeSelectedRows, getRowSelection: getEmployeeRowSelection } = Table.useSelectedRow({
    rowKey: 'id'
  });
  const { selectedRows: positionSelectedRows, getRowSelection: getPositionRowSelection } = Table.useSelectedRow({
    rowKey: 'id'
  });
  const [positionRefreshKey, setPositionRefreshKey] = React.useState(0);
  const [positions, setPositions] = React.useState(positionList);

  const employeeApis = {
    list: { loader: () => Promise.resolve({ pageData: employeeList, totalCount: employeeList.length }) },
    create: { loader: () => Promise.resolve({ code: 0 }) },
    save: { loader: () => Promise.resolve({ code: 0 }) },
    remove: { loader: () => Promise.resolve({ code: 0 }) }
  };

  const positionApis = {
    list: { loader: () => Promise.resolve({ pageData: positions, totalCount: positions.length }) },
    create: { loader: () => Promise.resolve({ code: 0 }) },
    save: { loader: () => Promise.resolve({ code: 0 }) },
    remove: { loader: () => Promise.resolve({ code: 0 }) }
  };

  const getEmployeeColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
    { name: 'name', title: '姓名', width: 120, renderType: 'main' },
    { name: 'employeeNo', title: '工号', width: 120 },
    { name: 'department', title: '部门', width: 140 },
    { name: 'position', title: '岗位', width: 160 },
    {
      name: 'status',
      title: '状态',
      width: 100,
      renderType: 'tag',
      getValueOf: item => employeeStatusMap[item.status] || { type: 'default', text: item.status }
    },
    { name: 'email', title: '邮箱', width: 180 },
    { name: 'phone', title: '联系电话', width: 130 }
  ];

  const getPositionColumns = () => [
    { name: 'name', title: '岗位名称', width: 200, renderType: 'main' },
    {
      name: 'status',
      title: '状态',
      width: 100,
      renderType: 'tag',
      getValueOf: item => positionStatusMap[item.status]
    },
    { name: 'description', title: '描述', width: 280, renderType: 'description', ellipsis: true },
    { name: 'publishAt', title: '发布时间', width: 170, format: 'datetime' },
    { name: 'createdAt', title: '创建时间', width: 170, format: 'datetime' }
  ];

  const getEmployeeFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="姓名" rule="REQ LEN-2-20" />,
        <Input name="employeeNo" label="工号" rule="REQ LEN-2-20" disabled={action === 'edit'} />,
        <Input name="department" label="部门" rule="REQ LEN-2-50" />,
        <Input name="position" label="岗位" rule="REQ LEN-2-50" />,
        <SuperSelect
          name="status"
          label="状态"
          single
          options={[
            { value: 'ACTIVE', label: '在职' },
            { value: 'RESIGN', label: '离职' }
          ]}
        />,
        <Input name="email" label="邮箱" rule="LEN-0-100" />,
        <Input name="phone" label="联系电话" rule="LEN-0-20" />
      ]}
    />
  );

  const getPositionFormInner = () => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="岗位名称" rule="REQ LEN-2-100" />,
        <TextArea name="description" label="岗位描述" rule="LEN-0-500" />
      ]}
    />
  );

  const handlePositionStatus = (id, status) => {
    const isPublish = status === 'published';
    Modal.confirm({
      title: isPublish ? '确认发布该岗位？' : '确认下线该岗位？',
      onOk: () => {
        setPositions(prev =>
          prev.map(item =>
            item.id === id
              ? {
                  ...item,
                  status,
                  publishAt: isPublish ? '2025-07-07 10:00:00' : item.publishAt
                }
              : item
          )
        );
        message.success(isPublish ? '岗位已发布' : '岗位已下线');
        setPositionRefreshKey(key => key + 1);
      }
    });
  };

  const getPositionActionList = ({ data, ...actionProps }) => {
    if (data.status === 'published') {
      return [
        {
          ...actionProps,
          data,
          children: '下线',
          onClick: () => handlePositionStatus(data.id, 'draft')
        }
      ];
    }
    return [
      {
        ...actionProps,
        data,
        children: '发布',
        onClick: () => handlePositionStatus(data.id, 'published')
      }
    ];
  };

  const renderBizPage = (title, renderProps) => (
    <Page title={title} extra={renderProps.titleExtra}>
      <TablePageRender {...renderProps} />
    </Page>
  );

  const employeePage = (
    <BizUnit
      isNext
      name="employee-list"
      apis={employeeApis}
      getColumns={getEmployeeColumns}
      getFormInner={getEmployeeFormInner}
      options={{
        bizName: '员工',
        keywordFilterName: 'keyword',
        keywordFilterLabel: '员工关键字',
        tableProps: {
          rowKey: 'id',
          rowSelection: getEmployeeRowSelection(employeeList),
          selectedRows: employeeSelectedRows,
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
          { type: InputFilterItem, props: { name: 'id', label: 'ID' } },
          {
            type: SuperSelectFilterItem,
            props: {
              name: 'status',
              label: '状态',
              single: true,
              options: [
                { value: 'ACTIVE', label: '在职' },
                { value: 'RESIGN', label: '离职' }
              ]
            }
          }
        ]
      }}
    >
      {renderProps => renderBizPage('员工档案', renderProps)}
    </BizUnit>
  );

  const positionPage = (
    <BizUnit
      key={positionRefreshKey}
      isNext
      name="position-list"
      apis={positionApis}
      getColumns={getPositionColumns}
      getFormInner={getPositionFormInner}
      getActionList={getPositionActionList}
      options={{
        bizName: '岗位',
        formSize: 'default',
        keywordFilterName: 'keyword',
        keywordFilterLabel: '岗位关键字',
        tableProps: {
          rowKey: 'id',
          rowSelection: getPositionRowSelection(positions),
          selectedRows: positionSelectedRows,
          pagination: { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
          batchActions: [
            {
              key: 'publish',
              label: '批量发布',
              onClick: ({ selectedRowKeys }) => message.success(`已发布 ${selectedRowKeys.length} 个岗位`)
            },
            {
              key: 'offline',
              label: '批量下线',
              onClick: ({ selectedRowKeys }) => message.warning(`已下线 ${selectedRowKeys.length} 个岗位`)
            }
          ]
        }
      }}
    >
      {renderProps => renderBizPage('岗位管理', renderProps)}
    </BizUnit>
  );

  return (
    <PureGlobal preset={{ ...preset, apis: { employee: employeeApis, position: positionApis } }}>
      <SystemLayout
        userInfo={{
          name: '张明',
          description: 'HR 管理员 · 杭州云帆科技'
        }}
        menu={{
          base: baseUrl,
          items: [
            { path: '/employee', label: '员工档案', icon: 'icon-groups_2' },
            { path: '/position', label: '岗位管理', icon: 'icon-assignment' }
          ]
        }}
      >
        <Routes>
          <Route
            path={`${baseUrl}/*`}
            element={
              <AppChildrenRouter
                baseUrl={baseUrl}
                list={[
                  {
                    index: true,
                    element: <Navigate to="employee" replace />
                  },
                  {
                    path: 'employee',
                    element: employeePage
                  },
                  {
                    path: 'position',
                    element: positionPage
                  }
                ]}
              />
            }
          />
          <Route path="*" element={<Navigate to={`${baseUrl}/employee`} replace />} />
        </Routes>
      </SystemLayout>
    </PureGlobal>
  );
});

render(<SystemLayoutNextExample />);
