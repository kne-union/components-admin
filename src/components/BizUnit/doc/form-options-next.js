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
    { name: 'id', title: 'ID', width: 80, renderType: 'small' },
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
