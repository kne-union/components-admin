const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { default: AppChildrenRouter } = appChildrenRouter;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/biz-unit-layout';

const departmentList = [
  {
    id: 1,
    name: '技术研发部',
    code: 'RD',
    leader: '张明',
    status: 'open',
    memberCount: 28,
    description: '负责产品研发与技术创新'
  },
  {
    id: 2,
    name: '产品设计部',
    code: 'PD',
    leader: '李芳',
    status: 'open',
    memberCount: 12,
    description: '负责产品规划与交互设计'
  },
  {
    id: 3,
    name: '市场营销部',
    code: 'MKT',
    leader: '王强',
    status: 'closed',
    memberCount: 15,
    description: '负责品牌推广与渠道拓展'
  }
];

const categoryList = [
  {
    id: 1,
    name: '软件服务',
    parent: '-',
    sort: 1,
    status: 'open',
    description: 'SaaS 与定制开发服务'
  },
  {
    id: 2,
    name: '硬件设备',
    parent: '-',
    sort: 2,
    status: 'open',
    description: '服务器、网络设备等'
  },
  {
    id: 3,
    name: '云存储',
    parent: '软件服务',
    sort: 1,
    status: 'open',
    description: '对象存储与备份服务'
  }
];

const statusMap = {
  open: { type: 'success', text: '启用' },
  closed: { type: 'default', text: '停用' }
};

const getItemExtra = (columns, item) => {
  const column = (columns || []).find(col => col.name === 'options' || col.renderType === 'options');
  const value = typeof column?.getValueOf === 'function' ? column.getValueOf(item, { place: 'end' }) : null;
  return value?.children || null;
};

const renderOrgCard = ({ dataSource = [], columns, renderToolbar }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            {[item.code, item.parent, item.leader, item.description].filter(Boolean).join(' · ')}
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #f0f0f0' }}>{getItemExtra(columns, item)}</div>
        </div>
      ))}
    </div>
  </div>
);

const departmentApis = {
  list: { loader: () => Promise.resolve({ pageData: departmentList, totalCount: departmentList.length }) },
  create: { loader: () => Promise.resolve({ code: 0 }) },
  save: { loader: () => Promise.resolve({ code: 0 }) },
  remove: { loader: () => Promise.resolve({ code: 0 }) }
};

const categoryApis = {
  list: { loader: () => Promise.resolve({ pageData: categoryList, totalCount: categoryList.length }) },
  create: { loader: () => Promise.resolve({ code: 0 }) },
  save: { loader: () => Promise.resolve({ code: 0 }) },
  remove: { loader: () => Promise.resolve({ code: 0 }) }
};

const LayoutNextExample = createWithRemoteLoader({
  modules: [
    'components-core:Global@PureGlobal',
    'components-core:Layout',
    'components-core:Menu',
    'components-core:FormInfo',
    'components-core:Filter',
    'components-core:TablePage@Table'
  ]
})(({ remoteModules }) => {
  const [PureGlobal, Layout, Menu, FormInfo, Filter, Table] = remoteModules;
  const { Input, TextArea, SuperSelect } = FormInfo.fields;
  const { InputFilterItem, SuperSelectFilterItem } = Filter.fields;
  const { message } = antd;
  const { selectedRows: departmentSelectedRows, getRowSelection: getDepartmentRowSelection } = Table.useSelectedRow({
    rowKey: 'id'
  });
  const { selectedRows: categorySelectedRows, getRowSelection: getCategoryRowSelection } = Table.useSelectedRow({
    rowKey: 'id'
  });

  const menu = (
    <Menu
      items={[
        { path: `${baseUrl}/department`, label: '部门管理' },
        { path: `${baseUrl}/category`, label: '产品分类' }
      ]}
    />
  );

  const getDepartmentColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
    { name: 'name', title: '部门名称', width: 160, renderType: 'main' },
    { name: 'code', title: '部门编码', width: 120 },
    { name: 'leader', title: '负责人', width: 120 },
    {
      name: 'status',
      title: '状态',
      width: 100,
      renderType: 'tag',
      getValueOf: item => statusMap[item.status]
    },
    { name: 'memberCount', title: '人数', width: 80 },
    { name: 'description', title: '描述', width: 240, renderType: 'description', ellipsis: true }
  ];

  const getCategoryColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
    { name: 'name', title: '分类名称', width: 160, renderType: 'main' },
    { name: 'parent', title: '上级分类', width: 140 },
    { name: 'sort', title: '排序', width: 80 },
    {
      name: 'status',
      title: '状态',
      width: 100,
      renderType: 'tag',
      getValueOf: item => statusMap[item.status]
    },
    { name: 'description', title: '描述', width: 240, renderType: 'description', ellipsis: true }
  ];

  const getDepartmentFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="部门名称" rule="REQ LEN-2-50" />,
        <Input name="code" label="部门编码" rule="REQ LEN-2-20" disabled={action === 'edit'} />,
        <Input name="leader" label="负责人" rule="REQ LEN-2-20" />,
        <SuperSelect
          name="status"
          label="状态"
          single
          options={[
            { value: 'open', label: '启用' },
            { value: 'closed', label: '停用' }
          ]}
        />,
        <TextArea name="description" label="描述" rule="LEN-0-200" />
      ]}
    />
  );

  const getCategoryFormInner = () => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="分类名称" rule="REQ LEN-2-50" />,
        <Input name="parent" label="上级分类" rule="LEN-0-50" />,
        <Input name="sort" label="排序" rule="REQ NUMBER" />,
        <SuperSelect
          name="status"
          label="状态"
          single
          options={[
            { value: 'open', label: '启用' },
            { value: 'closed', label: '停用' }
          ]}
        />,
        <TextArea name="description" label="描述" rule="LEN-0-200" />
      ]}
    />
  );

  const pageProps = { menu, menuFixed: false };

  const departmentTableOptions = {
    bizName: '部门',
    keywordFilterName: 'keyword',
    keywordFilterLabel: '部门关键字',
    tableProps: {
      rowKey: 'id',
      renderMobile: renderOrgCard,
      renderCard: renderOrgCard,
      rowSelection: getDepartmentRowSelection(departmentList),
      selectedRows: departmentSelectedRows,
      pagination: { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
      batchActions: [
        {
          key: 'enable',
          label: '批量启用',
          onClick: ({ selectedRowKeys }) => message.success(`已启用 ${selectedRowKeys.length} 个部门`)
        },
        {
          key: 'disable',
          label: '批量停用',
          onClick: ({ selectedRowKeys }) => message.warning(`已停用 ${selectedRowKeys.length} 个部门`)
        },
        {
          key: 'export',
          label: '批量导出',
          onClick: ({ selectedRowKeys }) => message.info(`正在导出 ${selectedRowKeys.length} 个部门`)
        }
      ]
    }
  };

  const departmentFilter = {
    list: [
      { type: InputFilterItem, props: { name: 'code', label: '部门编码' } },
      { type: InputFilterItem, props: { name: 'leader', label: '负责人' } },
      {
        type: SuperSelectFilterItem,
        props: {
          name: 'status',
          label: '状态',
          single: true,
          options: [
            { value: 'open', label: '启用' },
            { value: 'closed', label: '停用' }
          ]
        }
      }
    ]
  };

  const categoryTableOptions = {
    bizName: '分类',
    keywordFilterName: 'keyword',
    keywordFilterLabel: '分类关键字',
    tableProps: {
      rowKey: 'id',
      renderMobile: renderOrgCard,
      renderCard: renderOrgCard,
      rowSelection: getCategoryRowSelection(categoryList),
      selectedRows: categorySelectedRows,
      pagination: { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
      batchActions: [
        {
          key: 'enable',
          label: '批量启用',
          onClick: ({ selectedRowKeys }) => message.success(`已启用 ${selectedRowKeys.length} 个分类`)
        },
        {
          key: 'disable',
          label: '批量停用',
          onClick: ({ selectedRowKeys }) => message.warning(`已停用 ${selectedRowKeys.length} 个分类`)
        }
      ]
    }
  };

  const categoryFilter = {
    list: [
      { type: InputFilterItem, props: { name: 'parent', label: '上级分类' } },
      {
        type: SuperSelectFilterItem,
        props: {
          name: 'status',
          label: '状态',
          single: true,
          options: [
            { value: 'open', label: '启用' },
            { value: 'closed', label: '停用' }
          ]
        }
      }
    ]
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { department: departmentApis, category: categoryApis } }}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route
            path={`${baseUrl}/*`}
            element={
              <AppChildrenRouter
                baseUrl={baseUrl}
                list={[
                  {
                    index: true,
                    element: <Navigate to="department" replace />
                  },
                  {
                    path: 'department',
                    element: (
                      <BizUnit
                        isNext
                        name="department-list"
                        apis={departmentApis}
                        getColumns={getDepartmentColumns}
                        getFormInner={getDepartmentFormInner}
                        page={{ title: '部门管理', ...pageProps }}
                        options={departmentTableOptions}
                        filter={departmentFilter}
                      />
                    )
                  },
                  {
                    path: 'category',
                    element: (
                      <BizUnit
                        isNext
                        name="category-list"
                        apis={categoryApis}
                        getColumns={getCategoryColumns}
                        getFormInner={getCategoryFormInner}
                        page={{ title: '产品分类', ...pageProps }}
                        options={categoryTableOptions}
                        filter={categoryFilter}
                      />
                    )
                  }
                ]}
              />
            }
          />
          <Route path="*" element={<Navigate to={`${baseUrl}/department`} replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<LayoutNextExample />);
