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
    { name: 'id', title: 'ID', width: 80, renderType: 'small' },
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
