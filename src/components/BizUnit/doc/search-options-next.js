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
