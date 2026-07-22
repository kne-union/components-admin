# BizUnit

### 概述

高度封装的 CRUD 业务单元组件，内置列表展示、关键字搜索、筛选、创建、编辑、删除、状态切换等完整能力。通过配置 `apis`、`getColumns`、`getFormInner` 即可快速落地标准列表页，无需重复编写表格、弹窗与请求逻辑。新业务模块须使用 `isNext` 模式。

### 核心特性

- **配置驱动**：仅凭 `apis`、`getColumns`、`getFormInner` 三项核心配置即可生成完整 CRUD 列表页，操作列由组件自动追加
- **isNext 新版表格**：基于 `@kne/table-page`，支持 `renderType`、`getValueOf`、`format` 等现代化列配置，内置关键字搜索与分页
- **灵活筛选**：`filter` 配置筛选项，isNext 为一维数组，支持输入框、下拉、日期区间等，可配合 `urlFilterValue` 实现 URL 参数同步
- **自定义布局**：通过 `children` 回调接管渲染，配合 `TablePageRender` 适配 `SystemLayout`、`StateBarPage` 等多种容器
- **可扩展操作**：`getActionList` 支持重置内置按钮、追加自定义按钮，行内操作灵活可控

### 适用场景

- 标准业务列表页：角色、员工、产品、订单等增删改查管理
- 多页面模块：配合 `AppChildrenRouter` 实现左侧菜单 + 多子路由列表
- 带状态分组：配合 `StateBarPage` 按状态分 Tab 展示
- 系统管理后台：配合 `SystemLayout` + `Page` 构建管理界面
- 需要批量操作、URL 筛选同步、只读列表等定制化场景

### 技术亮点

- 基于 `createWithRemoteLoader` 远程加载 `components-core` 表格、筛选、表单等模块，组件本体保持轻量
- 内置国际化（`withLocale`），默认中英文，支持 `formatMessage` 定制列标题与文案
- 自动数据格式转换：`isNext` 模式将 `{ pageData, totalCount }` 转为 TablePage 所需结构
- 操作列智能构建：`buildOptionsColumn` 根据可用 API 自动生成编辑、删除、状态切换按钮
- 导出 `TablePageRender`、`Actions` 子组件，可脱离 BizUnit 独立使用


### 示例

#### 示例代码

- 角色管理（基础 CRUD）
- 场景：角色权限管理。覆盖 isNext、apis（含函数形式）、getColumns（renderType/tag/datetime/description）、getFormInner（create/edit）、page、onMount、options 按钮文案与 removeMessage、关键字搜索。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

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
            removeMessage: '删除后该角色下的用户将失去对应权限，确定继续？'
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<BaseNextExample />);

```

- 员工档案（筛选与批量操作）
- 场景：人力资源。覆盖 filter（Input/SuperSelect/DateRange）、options.mapFilterValue、tableProps.pagination/rowSelection/batchActions、列 format:date。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
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
                  onClick: ({ selectedRowKeys }) => message.info(&#96;正在导出 ${selectedRowKeys.length} 名员工档案&#96;)
                },
                {
                  key: 'notify',
                  label: '批量通知',
                  onClick: ({ selectedRowKeys }) => message.success(&#96;已向 ${selectedRowKeys.length} 名员工发送通知&#96;)
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

```

- 产品目录（表单弹窗配置）
- 场景：商品管理。覆盖 options.formSize、formProps、formModalProps、createFormModalProps、editFormModalProps、saveData。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const productList = [
  {
    id: 1,
    name: '企业版 SaaS 订阅',
    sku: 'PROD-SAAS-001',
    category: 'subscription',
    price: 2999,
    status: 'open',
    _readOnly: { createdBy: '系统', createdAt: '2025-01-01' },
    description: '按年订阅，含 50 个席位与基础技术支持'
  },
  {
    id: 2,
    name: 'API 调用流量包',
    sku: 'PROD-API-100W',
    category: 'addon',
    price: 599,
    status: 'open',
    _readOnly: { createdBy: '张明', createdAt: '2025-03-15' },
    description: '100 万次 API 调用额度，有效期 12 个月'
  },
  {
    id: 3,
    name: '私有化部署许可',
    sku: 'PROD-ONPREM-001',
    category: 'license',
    price: 98000,
    status: 'closed',
    _readOnly: { createdBy: '李芳', createdAt: '2024-11-20' },
    description: '一次性买断，含首年维保服务'
  }
];

const FormOptionsNextExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Layout] = remoteModules;
  const { Input, TextArea, InputNumber, SuperSelect } = FormInfo.fields;

  const categoryMap = {
    subscription: { type: 'processing', text: '订阅服务' },
    addon: { type: 'default', text: '增值包' },
    license: { type: 'warning', text: '许可证' }
  };

  const getColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
    { name: 'name', title: '产品名称', width: 200, renderType: 'main' },
    { name: 'sku', title: 'SKU', width: 160 },
    {
      name: 'category',
      title: '类别',
      width: 110,
      renderType: 'tag',
      getValueOf: item => categoryMap[item.category]
    },
    { name: 'price', title: '价格（元）', width: 120 },
    { name: 'description', title: '说明', width: 280, renderType: 'description', ellipsis: true }
  ];

  const getFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="产品名称" rule="REQ LEN-2-100" />,
        <Input name="sku" label="SKU 编码" rule="REQ LEN-2-50" disabled={action === 'edit'} />,
        <SuperSelect
          name="category"
          label="产品类别"
          single
          options={[
            { value: 'subscription', label: '订阅服务' },
            { value: 'addon', label: '增值包' },
            { value: 'license', label: '许可证' }
          ]}
        />,
        <InputNumber name="price" label="价格（元）" rule="REQ" />,
        <TextArea name="description" label="产品说明" rule="LEN-0-500" />
      ]}
    />
  );

  const apis = {
    list: { loader: () => Promise.resolve({ pageData: productList, totalCount: productList.length }) },
    create: { loader: () => Promise.resolve({ code: 0, data: { id: Date.now() } }) },
    save: ({ formData, data }) => ({
      loader: () => Promise.resolve({ code: 0, data: { ...formData, id: data.id } })
    }),
    remove: { loader: () => Promise.resolve({ code: 0 }) }
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { product: apis } }}>
      <Layout navigation={{ isFixed: false }}>
        <BizUnit
          isNext
          name="product-list"
          page={{ title: '产品目录' }}
          apis={apis}
          getColumns={getColumns}
          getFormInner={getFormInner}
          options={{
            bizName: '产品',
            formSize: 'medium',
            saveData: (data) => {
              const { _readOnly, ...editable } = data;
              return editable;
            },
            formProps: ({ action, onSubmit }) => ({
              column: 1,
              onSubmit
            }),
            formModalProps: { destroyOnClose: true },
            createFormModalProps: { title: '上架新产品', size: 'medium' },
            editFormModalProps: { title: '编辑产品信息', size: 'medium' }
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<FormOptionsNextExample />);

```

- 销售订单（URL 筛选同步）
- 场景：订单中心。覆盖 urlFilterValue、onFilterChange、filter 与关键字搜索联动、renderType:status。示例环境已有外层 Router，通过 useSearchParams 初始化 URL 参数，勿嵌套 MemoryRouter。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom),antd(antd)

```jsx
const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useSearchParams } = reactRouterDom;

const orderList = [
  {
    id: 'ORD-2025-001',
    customerName: '杭州云帆科技有限公司',
    amount: 45800,
    status: 'pending',
    orderDate: '2025-07-01',
    description: '企业版 SaaS 年度订阅 + API 流量包'
  },
  {
    id: 'ORD-2025-002',
    customerName: '上海智联信息技术有限公司',
    amount: 128000,
    status: 'paid',
    orderDate: '2025-07-02',
    description: '私有化部署许可及首年维保'
  },
  {
    id: 'ORD-2025-003',
    customerName: '北京星辰数据服务有限公司',
    amount: 8900,
    status: 'cancelled',
    orderDate: '2025-06-28',
    description: '增值包续费，客户主动取消'
  },
  {
    id: 'ORD-2025-004',
    customerName: '深圳创新互联科技有限公司',
    amount: 23600,
    status: 'pending',
    orderDate: '2025-07-03',
    description: '席位扩容 20 个，待财务确认'
  }
];

// 示例环境已有外层 Router，勿再包裹 MemoryRouter / BrowserRouter
const InitUrlFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  React.useEffect(() => {
    if (!searchParams.get('status')) {
      setSearchParams({ status: 'pending' }, { replace: true });
    }
  }, []);
  return null;
};

const UrlFilterNextExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Filter', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Filter, Layout] = remoteModules;
  const { InputFilterItem, SuperSelectFilterItem } = Filter.fields;
  const { message } = antd;

  const statusMap = {
    pending: { type: 'warning', text: '待付款' },
    paid: { type: 'success', text: '已付款' },
    cancelled: { type: 'default', text: '已取消' }
  };

  const getColumns = () => [
    { name: 'id', title: '订单号', width: 150, renderType: 'main' },
    { name: 'customerName', title: '客户名称', width: 220 },
    { name: 'amount', title: '金额（元）', width: 120 },
    {
      name: 'status',
      title: '状态',
      width: 100,
      renderType: 'status',
      getValueOf: item => statusMap[item.status]
    },
    { name: 'orderDate', title: '下单日期', width: 120, format: 'date' },
    { name: 'description', title: '备注', width: 260, renderType: 'description', ellipsis: true }
  ];

  const apis = {
    list: { loader: () => Promise.resolve({ pageData: orderList, totalCount: orderList.length }) }
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { order: apis } }}>
      <Layout navigation={{ isFixed: false }}>
        <InitUrlFilter />
        <BizUnit
          isNext
          name="order-list"
          page={{ title: '销售订单' }}
          apis={apis}
          getColumns={getColumns}
          urlFilterValue={['status', 'customerName']}
          onFilterChange={value => message.info(&#96;筛选条件已变更：${JSON.stringify(value)}&#96;)}
          options={{
            keywordFilterName: 'customerName',
            keywordFilterLabel: '客户名称'
          }}
          filter={{
            list: [
              {
                type: SuperSelectFilterItem,
                props: {
                  name: 'status',
                  label: '订单状态',
                  single: true,
                  options: [
                    { value: 'pending', label: '待付款' },
                    { value: 'paid', label: '已付款' },
                    { value: 'cancelled', label: '已取消' }
                  ]
                }
              },
              {
                type: InputFilterItem,
                props: { name: 'customerName', label: '客户名称' }
              }
            ]
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<UrlFilterNextExample />);

```

- 供应商名录（关闭关键字搜索）
- 场景：采购管理。覆盖 allowKeywordSearch={false}，仅通过 filter 筛选，只读列表（无 create API）。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const supplierList = [
  {
    id: 1,
    name: '深圳市华强电子有限公司',
    code: 'SUP-HQ-001',
    category: 'hardware',
    contact: '陈建国',
    phone: '0755-88880001',
    description: '服务器、网络设备核心供应商，合作 5 年'
  },
  {
    id: 2,
    name: '北京中科软件服务有限公司',
    code: 'SUP-ZK-002',
    category: 'software',
    contact: '刘晓梅',
    phone: '010-66660002',
    description: '中间件与数据库授权代理商'
  },
  {
    id: 3,
    name: '上海优印图文制作中心',
    code: 'SUP-YY-003',
    category: 'service',
    contact: '周伟',
    phone: '021-55550003',
    description: '宣传物料印刷与展台搭建'
  }
];

const SearchOptionsNextExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Filter', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Filter, Layout] = remoteModules;
  const { InputFilterItem, SuperSelectFilterItem } = Filter.fields;

  const categoryMap = {
    hardware: { type: 'processing', text: '硬件设备' },
    software: { type: 'success', text: '软件授权' },
    service: { type: 'default', text: '外包服务' }
  };

  const getColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
    { name: 'name', title: '供应商名称', width: 240, renderType: 'main' },
    { name: 'code', title: '编码', width: 140 },
    {
      name: 'category',
      title: '类别',
      width: 110,
      renderType: 'tag',
      getValueOf: item => categoryMap[item.category]
    },
    { name: 'contact', title: '联系人', width: 100 },
    { name: 'phone', title: '联系电话', width: 140 },
    { name: 'description', title: '合作说明', width: 280, renderType: 'description', ellipsis: true }
  ];

  const apis = {
    list: { loader: () => Promise.resolve({ pageData: supplierList, totalCount: supplierList.length }) }
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { supplier: apis } }}>
      <Layout navigation={{ isFixed: false }}>
        <BizUnit
          isNext
          name="supplier-list"
          page={{ title: '供应商名录' }}
          apis={apis}
          getColumns={getColumns}
          allowKeywordSearch={false}
          filter={{
            list: [
              {
                type: InputFilterItem,
                props: { name: 'name', label: '供应商名称' }
              },
              {
                type: InputFilterItem,
                props: { name: 'code', label: '供应商编码' }
              },
              {
                type: SuperSelectFilterItem,
                props: {
                  name: 'category',
                  label: '类别',
                  single: true,
                  options: [
                    { value: 'hardware', label: '硬件设备' },
                    { value: 'software', label: '软件授权' },
                    { value: 'service', label: '外包服务' }
                  ]
                }
              }
            ]
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<SearchOptionsNextExample />);

```

- 权限角色（自定义行操作）
- 场景：角色权限。覆盖 getActionList 重置内置按钮（hidden/reset）、buttonComponent 自定义操作，系统角色保护。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
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
          children: &#96;当前角色【${data.name}】拥有以下权限：\n- 用户管理\n- 角色管理\n- 系统设置&#96;
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
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
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

```

- 组织架构（Layout@TablePage 多页面）(全屏)
- 场景：部门与分类管理。AppChildrenRouter + components-core:Layout 多子路由；BizUnit isNext 默认渲染 Layout@TablePage（page.menu 侧栏导航）；覆盖 filter、tableProps.batchActions/rowSelection。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),appChildrenRouter(@kne/app-children-router),reactRouterDom(react-router-dom),antd(antd)

```jsx
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
        { path: &#96;${baseUrl}/department&#96;, label: '部门管理' },
        { path: &#96;${baseUrl}/category&#96;, label: '产品分类' }
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
      rowSelection: getDepartmentRowSelection(departmentList),
      selectedRows: departmentSelectedRows,
      pagination: { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
      batchActions: [
        {
          key: 'enable',
          label: '批量启用',
          onClick: ({ selectedRowKeys }) => message.success(&#96;已启用 ${selectedRowKeys.length} 个部门&#96;)
        },
        {
          key: 'disable',
          label: '批量停用',
          onClick: ({ selectedRowKeys }) => message.warning(&#96;已停用 ${selectedRowKeys.length} 个部门&#96;)
        },
        {
          key: 'export',
          label: '批量导出',
          onClick: ({ selectedRowKeys }) => message.info(&#96;正在导出 ${selectedRowKeys.length} 个部门&#96;)
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
      rowSelection: getCategoryRowSelection(categoryList),
      selectedRows: categorySelectedRows,
      pagination: { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
      batchActions: [
        {
          key: 'enable',
          label: '批量启用',
          onClick: ({ selectedRowKeys }) => message.success(&#96;已启用 ${selectedRowKeys.length} 个分类&#96;)
        },
        {
          key: 'disable',
          label: '批量停用',
          onClick: ({ selectedRowKeys }) => message.warning(&#96;已停用 ${selectedRowKeys.length} 个分类&#96;)
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
            path={&#96;${baseUrl}/*&#96;}
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
          <Route path="*" element={<Navigate to={&#96;${baseUrl}/department&#96;} replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<LayoutNextExample />);

```

- 人才管理（SystemLayout 综合场景）(全屏)
- 参考 ai-talent-saas TenantAdmin：AppChildrenRouter + SystemLayout + BizUnit isNext children；@kne/system-layout 的 Page 承载标题，TablePageRender 渲染新版 TablePage；员工档案支持表格/卡片视图切换，覆盖 filter、tableProps.renderCard/batchActions/rowSelection。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),_systemLayout(@kne/system-layout),(@kne/system-layout/dist/index.css),appChildrenRouter(@kne/app-children-router),reactRouterDom(react-router-dom),antd(antd)

```jsx
const { default: BizUnit, TablePageRender } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { default: SystemLayout, Page } = _systemLayout;
const { default: AppChildrenRouter } = appChildrenRouter;
const { Route, Routes, Navigate } = reactRouterDom;
const { Card, Col, Flex, Modal, Row, Tag, message } = antd;

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

const renderEmployeeCard = ({ dataSource = [] }) => (
  <Row gutter={[12, 12]}>
    {dataSource.map(item => {
      const status = employeeStatusMap[item.status] || { type: 'default', text: item.status };
      return (
        <Col span={12} key={item.id}>
          <Card size="small" title={item.name} extra={<Tag color={status.type}>{status.text}</Tag>}>
            <Flex vertical gap={8}>
              <span>
                {item.employeeNo} · {item.department}
              </span>
              <span>{item.position}</span>
              <span>{item.email}</span>
              <span>{item.phone}</span>
            </Flex>
          </Card>
        </Col>
      );
    })}
  </Row>
);

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
    <Page title={title}>
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
          renderCard: renderEmployeeCard,
          rowSelection: getEmployeeRowSelection(employeeList),
          selectedRows: employeeSelectedRows,
          pagination: { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
          batchActions: [
            {
              key: 'export',
              label: '批量导出',
              onClick: ({ selectedRowKeys }) => message.info(&#96;正在导出 ${selectedRowKeys.length} 名员工档案&#96;)
            },
            {
              key: 'notify',
              label: '批量通知',
              onClick: ({ selectedRowKeys }) => message.success(&#96;已向 ${selectedRowKeys.length} 名员工发送通知&#96;)
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
              onClick: ({ selectedRowKeys }) => message.success(&#96;已发布 ${selectedRowKeys.length} 个岗位&#96;)
            },
            {
              key: 'offline',
              label: '批量下线',
              onClick: ({ selectedRowKeys }) => message.warning(&#96;已下线 ${selectedRowKeys.length} 个岗位&#96;)
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
            path={&#96;${baseUrl}/*&#96;}
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
          <Route path="*" element={<Navigate to={&#96;${baseUrl}/employee&#96;} replace />} />
        </Routes>
      </SystemLayout>
    </PureGlobal>
  );
});

render(<SystemLayoutNextExample />);

```

- 订单中心（StateBarPage 自定义布局）
- 场景：订单管理。StateBarPage 状态栏（按付款状态）+ BizUnit children + TablePageRender；行内启用/禁用（setStatus）、编辑、删除。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { default: BizUnit, TablePageRender } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Button, Space } = antd;

const initialOrderList = [
  {
    id: 'ORD-2025-001',
    customerName: '杭州云帆科技有限公司',
    amount: 45800,
    payStatus: 'pending',
    status: 'open',
    orderDate: '2025-07-01',
    description: '企业版 SaaS 年度订阅 + API 流量包'
  },
  {
    id: 'ORD-2025-002',
    customerName: '上海智联信息技术有限公司',
    amount: 128000,
    payStatus: 'paid',
    status: 'open',
    orderDate: '2025-07-02',
    description: '私有化部署许可及首年维保'
  },
  {
    id: 'ORD-2025-003',
    customerName: '北京星辰数据服务有限公司',
    amount: 8900,
    payStatus: 'cancelled',
    status: 'closed',
    orderDate: '2025-06-28',
    description: '增值包续费，客户主动取消'
  },
  {
    id: 'ORD-2025-004',
    customerName: '深圳创新互联科技有限公司',
    amount: 23600,
    payStatus: 'pending',
    status: 'open',
    orderDate: '2025-07-03',
    description: '席位扩容 20 个，待财务确认'
  }
];

const payStatusMap = {
  pending: { type: 'warning', text: '待付款' },
  paid: { type: 'success', text: '已付款' },
  cancelled: { type: 'default', text: '已取消' }
};

const enableStatusMap = {
  open: { type: 'success', text: '已启用' },
  closed: { type: 'default', text: '已禁用' }
};

const ChildrenNextExample = createWithRemoteLoader({
  modules: [
    'components-core:Global@PureGlobal',
    'components-core:FormInfo',
    'components-core:Filter',
    'components-core:Layout',
    'components-core:Layout@StateBarPage'
  ]
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Filter, Layout, StateBarPage] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;
  const { InputFilterItem } = Filter.fields;
  const { message } = antd;
  const [activeKey, setActiveKey] = React.useState('all');
  const [orders, setOrders] = React.useState(initialOrderList);

  const countByPayStatus = payStatus =>
    payStatus === 'all' ? orders.length : orders.filter(item => item.payStatus === payStatus).length;

  const getColumns = () => [
    { name: 'id', title: '订单号', width: 150, renderType: 'main' },
    { name: 'customerName', title: '客户名称', width: 200 },
    { name: 'amount', title: '金额（元）', width: 120 },
    {
      name: 'payStatus',
      title: '付款状态',
      width: 100,
      renderType: 'status',
      getValueOf: item => payStatusMap[item.payStatus]
    },
    {
      name: 'status',
      title: '启用状态',
      width: 100,
      renderType: 'tag',
      getValueOf: item => enableStatusMap[item.status]
    },
    { name: 'orderDate', title: '下单日期', width: 120, format: 'date' },
    { name: 'description', title: '备注', width: 240, renderType: 'description', ellipsis: true }
  ];

  const getFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="customerName" label="客户名称" rule="REQ LEN-2-100" />,
        <Input name="amount" label="金额（元）" rule="REQ" disabled={action === 'edit'} />,
        <TextArea name="description" label="订单备注" />
      ]}
    />
  );

  const filteredList =
    activeKey === 'all' ? orders : orders.filter(item => item.payStatus === activeKey);

  const apis = {
    list: { loader: () => Promise.resolve({ pageData: filteredList, totalCount: filteredList.length }) },
    create: { loader: () => Promise.resolve({ code: 0 }) },
    save: { loader: () => Promise.resolve({ code: 0 }) },
    remove: { loader: () => Promise.resolve({ code: 0 }) },
    setStatus: ({ data }) => ({
      loader: () => {
        setOrders(prev =>
          prev.map(item =>
            item.id === data.id
              ? { ...item, status: item.status === 'open' ? 'closed' : 'open' }
              : item
          )
        );
        return Promise.resolve({ code: 0 });
      }
    })
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { order: apis } }}>
      <Layout navigation={{ isFixed: false }}>
        <StateBarPage
          page={{
            title: '订单中心',
            titleExtra: (
              <Space>
                <Button onClick={() => message.info('打开对账报表')}>对账报表</Button>
                <Button type="primary" onClick={() => message.success('导出任务已创建')}>
                  导出订单
                </Button>
              </Space>
            )
          }}
          stateBar={{
            activeKey,
            onChange: setActiveKey,
            stateOption: [
              { tab: &#96;全部 (${countByPayStatus('all')})&#96;, key: 'all' },
              { tab: &#96;待付款 (${countByPayStatus('pending')})&#96;, key: 'pending' },
              { tab: &#96;已付款 (${countByPayStatus('paid')})&#96;, key: 'paid' },
              { tab: &#96;已取消 (${countByPayStatus('cancelled')})&#96;, key: 'cancelled' }
            ]
          }}
        >
          <BizUnit
            key={activeKey}
            isNext
            name="order-list-state-bar"
            apis={apis}
            getColumns={getColumns}
            getFormInner={getFormInner}
            options={{
              bizName: '订单',
              keywordFilterName: 'customerName',
              keywordFilterLabel: '客户名称',
              openStatus: 'open',
              closedStatus: 'closed',
              openButtonProps: { children: '启用' },
              closeButtonProps: { children: '禁用' },
              closeMessage: '禁用后该订单将停止履约流程，确定继续？',
              removeMessage: '删除后订单数据不可恢复，确定删除？'
            }}
            filter={{
              list: [
                {
                  type: InputFilterItem,
                  props: { name: 'customerName', label: '客户名称' }
                }
              ]
            }}
          >
            {renderProps => <TablePageRender {...renderProps} />}
          </BizUnit>
        </StateBarPage>
      </Layout>
    </PureGlobal>
  );
});

render(<ChildrenNextExample />);

```

- 项目管理（状态控制）
- 场景：项目台账。覆盖 apis.setStatus、options.openStatus/closedStatus、openButtonProps/closeButtonProps、closeMessage、renderType:status。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const StatusControlNextExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Layout] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;

  const statusMap = {
    active: { type: 'success', text: '进行中' },
    paused: { type: 'warning', text: '已暂停' },
    completed: { type: 'default', text: '已完成' }
  };

  const getColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
    { name: 'name', title: '项目名称', width: 180, renderType: 'main' },
    { name: 'code', title: '项目编码', width: 140 },
    {
      name: 'status',
      title: '状态',
      width: 100,
      renderType: 'status',
      getValueOf: item => statusMap[item.status] || { type: 'default', text: item.status }
    },
    { name: 'progress', title: '进度', width: 100 },
    { name: 'description', title: '描述', width: 280, renderType: 'description', ellipsis: true }
  ];

  const getFormInner = ({ action }) => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="项目名称" rule="REQ LEN-2-100" />,
        <Input name="code" label="项目编码" rule="REQ LEN-2-50" disabled={action === 'edit'} />,
        <TextArea name="description" label="项目描述" />
      ]}
    />
  );

  const apis = {
    list: {
      loader: () =>
        Promise.resolve({
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
    create: { loader: () => Promise.resolve({ code: 0 }) },
    save: { loader: () => Promise.resolve({ code: 0 }) },
    remove: { loader: () => Promise.resolve({ code: 0 }) },
    setStatus: { loader: () => Promise.resolve({ code: 0 }) }
  };

  return (
    <PureGlobal preset={{ ...preset, apis: { project: apis } }}>
      <Layout navigation={{ isFixed: false }}>
        <BizUnit
          isNext
          name="project-list-next"
          page={{ title: '项目管理' }}
          apis={apis}
          getColumns={getColumns}
          getFormInner={getFormInner}
          options={{
            bizName: '项目',
            openStatus: 'active',
            closedStatus: 'paused',
            openButtonProps: { children: '启动' },
            closeButtonProps: { children: '暂停' },
            removeMessage: '删除后项目相关数据不可恢复，确定删除？',
            closeMessage: '确定要暂停该项目吗？暂停后项目将停止所有自动任务。'
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<StatusControlNextExample />);

```

- Actions 子组件
- Actions 独立使用：默认渲染、getActionList 追加按钮、children 自定义按钮布局（moreType/itemClassName）。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
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

```

- Legacy 用法（已废弃）
- 【已废弃】旧版 API：filter、type/valueOf 列、getFilterValue、topOptionsSize。仅供维护旧代码对照。
- _BizUnit(@components/BizUnit),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),antd(antd)

```jsx
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
          children: &#96;当前角色【${data.name}】拥有以下权限：\n- 用户管理\n- 角色管理\n- 系统设置&#96;
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

```

### API

### BizUnit

高度封装的 CRUD 业务单元组件，内置列表、关键字搜索、筛选、创建、编辑、删除、状态切换等能力。通过配置 `apis`、`getColumns`、
`getFormInner` 即可快速落地标准列表页，操作列由组件自动追加。

#### 模式说明

|       | isNext（新建模块必用）                         | Legacy（已废弃）        |
|-------|----------------------------------------|--------------------|
| 启用    | `isNext`                               | 默认，不传 `isNext`     |
| 表格    | `Layout.TablePage` + `@kne/table-page` | `Table.TablePage`  |
| 外层要求  | **须在 `Layout` 内**                      | 无                  |
| 列配置   | `renderType`、`getValueOf`              | `type`、`valueOf`   |
| 筛选    | `filter`（`{ list }` 一维数组）       | `filter`（二维数组） |
| 页面标题  | `page.title`                           | 自行布局               |
| 关键字搜索 | TablePage 内置 `search`                  | 顶部 `SearchInput`   |
| 操作按钮  | TablePage 工具栏 `buttonGroup`（移动端为底部 ButtonFooter） | 顶部创建按钮 |

#### 属性

| 属性名                | 说明                                      | 类型              | 默认值   |
|--------------------|-----------------------------------------|-----------------|-------|
| isNext             | 启用新版表格与 API                             | Boolean         | false |
| apis               | API 配置对象                                | Object          | {}    |
| getColumns         | 列配置函数，返回列数组（不含操作列）                      | Function        | -     |
| getFormInner       | 表单内容函数，返回表单 JSX                         | Function        | -     |
| getActionList      | 操作列表函数，自定义行内按钮                          | Function        | -     |
| name               | 表格名称（缓存等）                               | String          | -     |
| page               | isNext 模式页面配置，如 `{ title }`             | Object          | -     |
| options            | 全局配置选项                                  | Object          | {}    |
| filter             | 筛选配置；isNext 为 `{ list }` 对象，Legacy 为二维数组 | Array \| Object | -     |
| allowKeywordSearch | 是否显示关键字搜索                               | Boolean         | true  |
| topOptionsSize     | Legacy 模式顶部搜索框尺寸                        | String          | -     |
| titleExtra         | 操作区额外内容（创建按钮旁）；isNext 渲染到工具栏 `buttonGroup`   | ReactNode       | null  |
| children           | 自定义渲染函数，接管布局                            | Function        | -     |
| onMount            | 组件挂载回调                                  | Function        | -     |
| onFilterChange     | 筛选变更回调                                  | Function        | -     |
| urlFilterValue     | URL 筛选参数映射，见 `Filter.useUrlFilterValue` | Array \| Object | -     |

#### apis

| 属性名       | 说明     | 类型                |
|-----------|--------|-------------------|
| list      | 列表接口   | Object / Function |
| create    | 创建接口   | Object / Function |
| save      | 编辑保存接口 | Object / Function |
| remove    | 删除接口   | Object / Function |
| setStatus | 状态切换接口 | Object / Function |

`create` / `save` / `remove` 支持函数形式，用于组装请求体：

```javascript
save: ({ formData, data }) =>
  Object.assign({}, apis.myEntity.save, { data: { ...formData, id: data.id } })
```

**isNext 列表数据格式**：接口返回 `{ pageData: [...], totalCount: number }`（`total` 亦可）。组件通过 `dataFormat` 转为
TablePage 所需的 `{ list, total }`。

#### options

| 属性名                  | 说明                                                           | 类型                | 默认值                                        |
|----------------------|--------------------------------------------------------------|-------------------|--------------------------------------------|
| bizName              | 业务名称（弹窗标题、确认文案）                                              | String            | ''                                         |
| createButtonProps    | 创建按钮属性                                                       | Object            | `{ children: '添加', type: 'primary' }`      |
| editButtonProps      | 编辑按钮                                                         | Object            | `{ children: '编辑' }`                       |
| removeButtonProps    | 删除按钮                                                         | Object            | `{ children: '删除' }`                       |
| openButtonProps      | 开启按钮                                                         | Object            | `{ children: '开启' }`                       |
| closeButtonProps     | 关闭按钮                                                         | Object            | `{ children: '关闭' }`                       |
| tableProps           | 表格属性；isNext 下可传 `rowSelection`、`batchActions`、`pagination`、`buttonGroup`（`list` 追加在创建按钮之后）等 | Object            | `{ pagination: { paramsType: 'params' } }` |
| keywordFilterName    | 关键字搜索字段名                                                     | String            | 'keyword'                                  |
| keywordFilterLabel   | 关键字搜索标签                                                      | String            | '关键字'                                      |
| formSize             | 表单弹窗尺寸                                                       | String            | 'small'                                    |
| formProps            | 表单属性                                                         | Object / Function | -                                          |
| formModalProps       | 表单弹窗属性                                                       | Object            | -                                          |
| createFormModalProps | 创建弹窗属性                                                       | Object            | -                                          |
| editFormModalProps   | 编辑弹窗属性                                                       | Object            | -                                          |
| openStatus           | 开启状态值                                                        | String            | 'open'                                     |
| closedStatus         | 关闭状态值                                                        | String            | 'closed'                                   |
| removeMessage        | 删除确认提示                                                       | String            | -                                          |
| closeMessage         | 关闭确认提示                                                       | String            | -                                          |
| saveData             | 编辑时数据处理                                                      | Function          | -                                          |
| getFilterValue       | Legacy 筛选值转换                                                 | Function          | -                                          |
| mapFilterValue       | 筛选值映射（isNext `filter` 可用）                               | Function          | -                                          |

#### filter（isNext）

传给 TablePage 内置筛选，结构为 `{ list }`，`list` 为**一维数组**，每项 `{ type, props }`：

```javascript
filter = {
  list: [
    {
      type: SuperSelectFilterItem,  // 来自 Filter.fields
      props: { name: 'status', label: '状态', single: true, options: [...] }
    }
  ]
}
```

- 勿使用 legacy 的二维数组，勿传 `displayLine`
- 筛选项组件从 `Filter.fields` 解构（`InputFilterItem`、`SuperSelectFilterItem`、`DateRangeFilterItem` 等）

#### getColumns

返回列配置数组，**不含操作列**（操作列由组件自动追加）。

##### isNext 列配置（推荐）

遵循 `@kne/table-page`：

| 配置         | 说明                                                      |
|------------|---------------------------------------------------------|
| name       | 字段名                                                     |
| title      | 列标题                                                     |
| width      | 列宽                                                      |
| renderType | `main`、`small`、`tag`、`status`、`description`、`options` 等 |
| getValueOf | 取值函数；tag/status 返回 `{ type, text }`                     |
| format     | `date`、`datetime`                                       |
| ellipsis   | 超出省略                                                    |
| fixed      | 固定列，如 `'right'`                                         |

枚举列可加载 `Enum` 组件，在 `getValueOf` 中通过 `valueOf` 渲染。

##### Legacy 列配置（已废弃）

| type         | 说明                               |
|--------------|----------------------------------|
| serialNumber | 序号                               |
| mainInfo     | 主信息                              |
| tag          | 标签，`valueOf` 返回 `{ type, text }` |
| description  | 描述                               |
| datetime     | 日期时间                             |
| avatar       | 头像                               |

#### getFormInner

| 参数      | 说明     | 类型                     |
|---------|--------|------------------------|
| action  | 操作类型   | `'create'` \| `'edit'` |
| apis    | API 配置 | Object                 |
| options | 配置选项   | Object                 |

使用 `FormInfo` 及 `FormInfo.fields` 定义字段。

#### getActionList

返回操作按钮配置数组，支持以下形式：

| 形式                                            | 说明                                       |
|-----------------------------------------------|------------------------------------------|
| `{ name, reset }`                             | 重置内置按钮；`reset` 接收原配置返回新配置（可设 `hidden` 等） |
| `{ name }`                                    | 引用内置按钮名                                  |
| `{ buttonComponent, children, hidden, data }` | 自定义按钮组件                                  |

**内置按钮名**：`remove`、`save`、`setStatusOpen`、`setStatusClose`

独立按钮组件内通过 `usePreset()` 获取 `ajax` 与 `apis`，成功后调用 `onSuccess` 刷新列表。

#### children

函数子节点，用于自定义列表外层布局。推荐配合 `@kne/system-layout`（无需 `components-core` 的 Layout / Page）：

1. 模块入口使用 `@kne/app-children-router` 的 `AppChildrenRouter` 管理子路由；示例环境外层用 `Layout` / `SystemLayout` 包裹
   `Routes`，`AppChildrenRouter` 不设 `element`（若使用 `element` 布局壳，须在壳内渲染 `<Outlet />`）
2. `SystemLayout` 提供侧栏菜单，包裹 `Routes` 与 `AppChildrenRouter`
3. `BizUnit` 开启 `isNext`，通过 `children` 回调渲染
4. `@kne/system-layout` 的 `Page` 承载 `title`；操作按钮已并入 `tableOptions.buttonGroup`，随表格工具栏渲染，无需再传 `extra`
5. `TablePageRender` 渲染新版 `components-core:TablePage`（`isNext` 时自动跳过 `Layout@TablePage` 外壳）

须引入 `@kne/system-layout/dist/index.css`。无需 `children` 时，`BizUnit isNext` 默认渲染 `Layout@TablePage`，配合
`AppChildrenRouter` + `page.menu` 实现多列表页。带状态 Tab 的列表页可配合 `StateBarPage`（`components-core`）。

回调参数：

| 参数           | isNext             | Legacy                      |
|--------------|--------------------|-----------------------------|
| isNext       | boolean            | boolean                     |
| filter       | `filter` 配置对象 | `{ value, onChange, list }` |
| topOptions   | `null`（操作已在 `tableOptions.buttonGroup`） | 顶部区域                        |
| titleExtra   | 同 topOptions       | FilterProvider 包裹的顶部        |
| tableOptions | 传给 TablePage 的完整配置（含 `buttonGroup` 操作按钮组） | 同上                          |

### Actions

行内操作按钮区域，通常由 BizUnit 内部使用，也可单独引用。

| 属性名           | 说明            | 类型       | 默认值    |
|---------------|---------------|----------|--------|
| moreType      | 更多按钮类型        | String   | 'link' |
| itemClassName | 按钮项 className | String   | -      |
| getActionList | 操作列表函数        | Function | -      |
| getFormInner  | 表单内容函数        | Function | -      |
| data          | 当前行数据         | Object   | -      |
| apis          | API 配置        | Object   | -      |
| options       | 配置选项          | Object   | -      |
| onSuccess     | 操作成功回调        | Function | -      |
| children      | 自定义渲染         | Function | -      |

### TablePageRender

表格页面渲染组件，配合 `children` 自定义布局。

| 属性名          | 说明                                   | 类型        |
|--------------|--------------------------------------|-----------|
| filter       | 筛选配置                                 | Object    |
| titleExtra   | 标题额外内容                               | ReactNode |
| tableOptions | 表格配置（来自 `children` 回调）               | Object    |
| page         | 页面配置（legacy 模式传给 `Layout@TablePage`） | Object    |

**渲染逻辑**：

- `tableOptions.isNext === true`：渲染新版 `components-core:TablePage`，供 `@kne/system-layout` 的 `Page` 等外层容器使用
- 否则：渲染 `components-core:Layout@TablePage`（含权限页与旧版表格）

---

带筛选时传入 `filter`；批量操作通过 `options.tableProps` 传入 `rowSelection`、`batchActions`（需配合
`Table.useSelectedRow`）。
