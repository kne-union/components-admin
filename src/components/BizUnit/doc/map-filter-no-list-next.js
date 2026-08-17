const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Alert, Typography } = antd;

const MODEL_TYPES = ['interview', 'talentReview'];

const modelList = [
  {
    id: 1,
    name: '通用一面模型',
    type: 'interview',
    status: 'open',
    description: 'AI 面试场景默认题型组合'
  },
  {
    id: 2,
    name: '技术岗深挖模型',
    type: 'interview',
    status: 'open',
    description: '偏技术追问与项目复盘'
  },
  {
    id: 3,
    name: '高潜盘点模型',
    type: 'talentReview',
    status: 'open',
    description: '人才盘点场景能力项评估'
  },
  {
    id: 4,
    name: '管理岗盘点模型',
    type: 'talentReview',
    status: 'closed',
    description: '管理潜力与协作评估'
  }
];

/**
 * 验收点（本示例专门验证）：
 * 1. 无 filter list、关闭关键字搜索时，options.mapFilterValue 仍会挂到 TablePage
 * 2. 首次加载 / 新建成功后 reload，列表请求 params.filter.type 始终存在
 * 上方 Alert 展示最近一次 list 请求参数；type 缺失时为 error
 */
const MapFilterNoListNextExample = createWithRemoteLoader({
  modules: [
    'components-core:Global@PureGlobal',
    'components-core:FormInfo',
    'components-core:Layout',
    'components-core:StateBar'
  ]
})(({ remoteModules }) => {
  const [PureGlobal, FormInfo, Layout, StateBar] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;
  const { message } = antd;
  const [activeKey, setActiveKey] = React.useState(MODEL_TYPES[0]);
  const [rows, setRows] = React.useState(modelList);
  const rowsRef = React.useRef(rows);
  rowsRef.current = rows;
  const [lastListParams, setLastListParams] = React.useState(null);

  const statusMap = {
    open: { type: 'success', text: '已启用' },
    closed: { type: 'default', text: '已禁用' }
  };

  const typeLabel = {
    interview: 'AI 面试',
    talentReview: '人才盘点'
  };

  const getColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
    { name: 'name', title: '模型名称', width: 180, renderType: 'main' },
    {
      name: 'type',
      title: '类型',
      width: 120,
      renderType: 'tag',
      getValueOf: item => ({ type: 'info', text: typeLabel[item.type] || item.type })
    },
    {
      name: 'status',
      title: '状态',
      width: 100,
      renderType: 'tag',
      getValueOf: item => statusMap[item.status] || { type: 'default', text: item.status }
    },
    { name: 'description', title: '描述', width: 280, renderType: 'description', ellipsis: true }
  ];

  const getFormInner = () => (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label="模型名称" rule="REQ LEN-2-50" />,
        <TextArea name="description" label="描述" />
      ]}
    />
  );

  const readRequestParams = payload => {
    if (!payload || typeof payload !== 'object') {
      return {};
    }
    if (payload.params && typeof payload.params === 'object') {
      return payload.params;
    }
    if (payload.data && typeof payload.data === 'object') {
      return payload.data;
    }
    return payload;
  };

  const apis = {
    list: {
      params: { clientId: 'demo-client' },
      loader: payload => {
        const params = readRequestParams(payload);
        setLastListParams(params);
        const type = params?.filter?.type;
        const pageData = rowsRef.current.filter(item => !type || item.type === type);
        return Promise.resolve({ pageData, totalCount: pageData.length });
      }
    },
    create: ({ formData }) => ({
      loader: () => {
        const next = {
          id: Date.now(),
          type: activeKey,
          status: 'open',
          ...formData
        };
        setRows(prev => [next, ...prev]);
        message.success(`已分配到「${typeLabel[activeKey]}」，列表将 reload`);
        return Promise.resolve({ code: 0, data: next });
      }
    }),
    remove: ({ data }) => ({
      loader: () => {
        setRows(prev => prev.filter(item => item.id !== data.id));
        return Promise.resolve({ code: 0, data: { id: data.id } });
      }
    })
  };

  const hasType = !!lastListParams?.filter?.type;
  const paramsText = lastListParams ? JSON.stringify(lastListParams, null, 2) : '（尚未发起列表请求）';

  return (
    <PureGlobal preset={{ ...preset, apis: { questionModel: apis } }}>
      <Layout navigation={{ isFixed: false }}>
        <div style={{ padding: '0 0 12px' }}>
          <Alert
            type={hasType ? 'success' : lastListParams ? 'error' : 'info'}
            showIcon
            message={
              hasType
                ? `验收通过：list 请求含 filter.type = ${lastListParams.filter.type}`
                : lastListParams
                  ? '验收失败：list 请求缺少 filter.type（create/reload 后仍缺则 Bug 未修）'
                  : '验收步骤：切换 Tab → 点「分配模型」提交 → 看下方参数是否仍含 filter.type'
            }
            description={
              <Typography.Paragraph style={{ marginBottom: 0 }} copyable={{ text: paramsText }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{paramsText}</pre>
              </Typography.Paragraph>
            }
          />
        </div>
        <StateBar
          activeKey={activeKey}
          onChange={setActiveKey}
          stateOption={[
            { tab: 'AI 面试', key: 'interview' },
            { tab: '人才盘点', key: 'talentReview' }
          ]}
        />
        <BizUnit
          key={activeKey}
          isNext
          name={`assigned-models-${activeKey}`}
          page={{ title: '客户模型分配（无筛选项 + mapFilterValue）' }}
          apis={apis}
          allowKeywordSearch={false}
          getColumns={getColumns}
          getFormInner={getFormInner}
          options={{
            bizName: '模型',
            createButtonProps: { children: '分配模型', type: 'primary' },
            createFormModalProps: { title: '分配模型' },
            // 无 filter list 时也必须生效，否则 create 后 reload 会丢掉固定 type
            mapFilterValue: (value, getFilterValue) => ({
              filter: Object.assign({}, getFilterValue(value), { type: activeKey })
            }),
            tableProps: {
              pagination: { paramsType: 'params', pageSize: 10 }
            }
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<MapFilterNoListNextExample />);
