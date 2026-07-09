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
              { tab: `全部 (${countByPayStatus('all')})`, key: 'all' },
              { tab: `待付款 (${countByPayStatus('pending')})`, key: 'pending' },
              { tab: `已付款 (${countByPayStatus('paid')})`, key: 'paid' },
              { tab: `已取消 (${countByPayStatus('cancelled')})`, key: 'cancelled' }
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
