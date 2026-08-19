const { default: BizUnit } = _BizUnit;
const { default: preset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Alert, Typography, Button } = antd;

const PAGE_SIZE = 6;
const TOTAL = 36;

const questionList = Array.from({ length: TOTAL }, (_, index) => ({
  id: index + 1,
  title: `面试题目 ${index + 1}`,
  language: index % 2 === 0 ? 'zh-CN' : 'en-US',
  createdAt: `2026-08-${String((index % 28) + 1).padStart(2, '0')} 09:00:00`
}));

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

const getItemExtra = (columns, item) => {
  const column = (columns || []).find(col => col.name === 'options' || col.renderType === 'options');
  const value = typeof column?.getValueOf === 'function' ? column.getValueOf(item, { place: 'end' }) : null;
  return value?.children || null;
};

const renderQuestionCard = ({ dataSource = [], columns }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {dataSource.map(item => (
      <div
        key={item.id}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          padding: 12,
          border: '1px solid #f0f0f0',
          borderRadius: 8
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>{item.title}</div>
          <div style={{ color: '#888', fontSize: 12 }}>
            ID {item.id} · {item.language}
          </div>
        </div>
        <div>{getItemExtra(columns, item)}</div>
      </div>
    ))}
  </div>
);

const AddDigitalTaskDemo = ({ data, onSuccess, children, ...props }) => {
  const { message } = antd;
  return (
    <Button
      type="link"
      {...props}
      onClick={() => {
        message.success(`已为「${data.title}」添加数字人任务`);
        onSuccess && onSuccess();
      }}
    >
      {children}
    </Button>
  );
};

/**
 * 验收点：卡片模式下拉加载到第 2 页后，行内操作触发的第一次请求必须是 currentPage=1。
 * 未修复时会带着 loadMore 留下的页码请求 currentPage=2。操作后继续下拉加载属于正常行为。
 */
const CardReloadAfterLoadMoreExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const [requests, setRequests] = React.useState([]);
  const pendingResetRef = React.useRef(false);
  const scrollRef = React.useRef(null);

  const getColumns = () => [
    { name: 'id', title: 'ID', width: 80, renderType: 'id' },
    { name: 'title', title: '题目', width: 240, renderType: 'main' },
    { name: 'language', title: '语言', width: 100 },
    { name: 'createdAt', title: '创建时间', width: 180, format: 'datetime' }
  ];

  const getActionList = ({ data, onSuccess, ...rest }) => [
    {
      ...rest,
      data,
      children: '添加数字人任务',
      buttonComponent: AddDigitalTaskDemo,
      onSuccess: () => {
        pendingResetRef.current = true;
        onSuccess && onSuccess();
      }
    }
  ];

  const apis = {
    list: {
      loader: payload => {
        const params = readRequestParams(payload);
        const currentPage = Number(params.currentPage) || 1;
        const perPage = Number(params.perPage) || PAGE_SIZE;
        const isReset = pendingResetRef.current;
        if (isReset) {
          pendingResetRef.current = false;
        }
        setRequests(prev => prev.concat({ currentPage, perPage, isReset, at: Date.now() }));
        const start = (currentPage - 1) * perPage;
        return Promise.resolve({
          pageData: questionList.slice(start, start + perPage),
          totalCount: questionList.length
        });
      }
    }
  };

  const hasLoadedNextPage = requests.some(item => item.currentPage >= 2 && !item.isReset);
  const lastReset = [...requests].reverse().find(item => item.isReset);
  const passed = lastReset && lastReset.currentPage === 1;
  const failed = lastReset && lastReset.currentPage >= 2;
  const paramsText = requests.length
    ? requests
        .map((item, index) => {
          const tag = item.isReset ? '  ← 操作后刷新' : item.currentPage > 1 ? '  ← 下拉加载' : '';
          return `#${index + 1} currentPage=${item.currentPage} perPage=${item.perPage}${tag}`;
        })
        .join('\n')
    : '（尚未发起列表请求）';

  return (
    <PureGlobal preset={{ ...preset, apis: { question: apis } }}>
      <Layout navigation={{ isFixed: false }}>
        <div style={{ padding: '0 0 12px' }}>
          <Alert
            type={passed ? 'success' : failed ? 'error' : 'info'}
            showIcon
            message={
              passed
                ? `验收通过：操作后刷新回到 currentPage = ${lastReset.currentPage}；之后继续下拉加载是正常行为`
                : failed
                  ? `验收失败：操作后第一次请求 currentPage = ${lastReset.currentPage}（应为 1）`
                  : hasLoadedNextPage
                    ? '已加载到第 2 页，请点任意题目的「添加数字人任务」'
                    : '验收步骤：将卡片列表滚到底加载第 2 页 → 点「添加数字人任务」→ 操作后第一次请求须为 currentPage=1'
            }
            description={
              <Typography.Paragraph style={{ marginBottom: 0 }} copyable={{ text: paramsText }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{paramsText}</pre>
              </Typography.Paragraph>
            }
          />
        </div>
        <div ref={scrollRef} style={{ height: 420, overflow: 'auto' }}>
          <BizUnit
            isNext
            name="question-card-reload-after-load-more"
            page={{ title: '题目管理（卡片下拉加载后刷新）' }}
            apis={apis}
            allowKeywordSearch={false}
            getColumns={getColumns}
            getActionList={getActionList}
            options={{
              bizName: '题目',
              tableProps: {
                forceCard: true,
                renderCard: renderQuestionCard,
                getScrollContainer: () => scrollRef.current,
                pagination: { paramsType: 'params', pageSize: PAGE_SIZE }
              }
            }}
          />
        </div>
      </Layout>
    </PureGlobal>
  );
});

render(<CardReloadAfterLoadMoreExample />);
