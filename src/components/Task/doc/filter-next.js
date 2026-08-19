const { AllTask, MyTask } = _Task;
const { default: mockPreset, loadFilteredTaskList } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { useMemo, useState } = React;
const { Alert, App, Button, Card, Flex, Segmented, Typography } = antd;

const { Text, Paragraph } = Typography;

const CompleteTaskAction = ({ data, onSuccess, ...props }) => {
  const { message } = App.useApp();
  return (
    <Button
      {...props}
      onClick={() => {
        message.success(`已完成任务 ${data?.id}，正在按当前筛选刷新列表`);
        onSuccess && onSuccess();
      }}
    />
  );
};

const acceptanceCases = [
  { label: '状态 = 失败', expect: '仅任务 1003（批量邮件通知）' },
  { label: '类型 = 数据导出', expect: '仅任务 1002（用户数据导出）' },
  { label: '执行方式 = 手动', expect: '任务 1001、1004' },
  { label: '目标名称包含「报告」', expect: '任务 1001、1006' },
  { label: '创建日期 2024-03-08', expect: '任务 1001–1004' },
  { label: '我的任务 → 完成 pending 任务', expect: '有成功提示，请求次数 +1，params.filter 仍含 runnerType: "manual"' }
];

const FilterNextExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  const [view, setView] = useState('all');
  const [debug, setDebug] = useState({ params: null, result: null, requestSeq: 0 });

  const preset = useMemo(() => {
    return Object.assign({}, mockPreset, {
      apis: Object.assign({}, mockPreset.apis, {
        task: Object.assign({}, mockPreset.apis.task, {
          list: {
            loader: props => {
              const params = props?.params || {};
              setDebug(prev =>
                Object.assign({}, prev, {
                  params,
                  requestedAt: new Date().toLocaleTimeString(),
                  requestSeq: (prev.requestSeq || 0) + 1
                })
              );
              return loadFilteredTaskList(props).then(result => {
                setDebug(prev =>
                  Object.assign({}, prev, {
                    result: {
                      totalCount: result.totalCount,
                      ids: (result.pageData || []).map(item => item.id)
                    }
                  })
                );
                return result;
              });
            }
          }
        })
      })
    });
  }, []);

  return (
    <PureGlobal preset={preset}>
      <Layout navigation={{ isFixed: false }}>
        <Flex vertical gap={16}>
          <Alert
            type="info"
            showIcon
            message="任务筛选验收（isNext + mapFilterValue）"
            description={
              <Flex vertical gap={8}>
                <Paragraph style={{ marginBottom: 0 }}>
                  下方表格切换筛选项后，列表条数与「最近一次请求」中的 <Text code>params.filter</Text> 应同步变化。
                  「我的任务」默认筛 pending，pending 手动任务会显示完成；点击后会强制刷新列表（mock 数据不会改状态），请看成功提示和请求次数。
                </Paragraph>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {acceptanceCases.map(item => (
                    <li key={item.label}>
                      <Text strong>{item.label}</Text> → {item.expect}
                    </li>
                  ))}
                </ul>
              </Flex>
            }
          />

          <Card size="small" title="最近一次请求（验收用）">
            <Flex vertical gap={12}>
              <Text type="secondary">
                请求时间：{debug.requestedAt || '-'}　次数：{debug.requestSeq || 0}
              </Text>
              <div>
                <Text strong>params.filter</Text>
                <pre style={{ margin: '8px 0 0', padding: 12, background: '#f5f5f5', borderRadius: 6, fontSize: 12 }}>
                  {JSON.stringify(debug.params?.filter || {}, null, 2)}
                </pre>
              </div>
              <div>
                <Text strong>返回结果</Text>
                <pre style={{ margin: '8px 0 0', padding: 12, background: '#f5f5f5', borderRadius: 6, fontSize: 12 }}>
                  {JSON.stringify(debug.result || {}, null, 2)}
                </pre>
              </div>
            </Flex>
          </Card>

          <Segmented
            value={view}
            onChange={setView}
            options={[
              { label: '全部任务', value: 'all' },
              { label: '我的任务（固定 manual）', value: 'my' }
            ]}
          />

          {view === 'all' ? (
            <AllTask
              baseUrl="/Task"
              pageProps={{
                title: '全部任务 · 筛选验收',
                menu: null,
                menuOpen: false,
                menuFixed: false
              }}
            />
          ) : (
            <MyTask
              baseUrl="/Task"
              getManualTaskAction={() => CompleteTaskAction}
              pageProps={{
                title: '我的任务 · 筛选验收',
                menu: null,
                menuOpen: false,
                menuFixed: false
              }}
            />
          )}
        </Flex>
      </Layout>
    </PureGlobal>
  );
});

render(<FilterNextExample />);
