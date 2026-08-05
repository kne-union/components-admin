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
          searchParamsValue={['status', 'customerName']}
          onFilterChange={value => message.info(`筛选条件已变更：${JSON.stringify(value)}`)}
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
