const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Flex, Typography } = antd;

const TOTAL_USERS = 256;
const PAGE_SIZE = 20;
const LOAD_DELAY_MS = 400;
const ORG_ROOT_COUNT = 10;
const TEAMS_PER_ORG = 8;

const POSITIONS = ['前端工程师', '后端工程师', 'UI 设计师', '产品经理', '测试工程师', '运维工程师'];

const buildLargeOrgList = () => {
  const list = [];
  for (let i = 1; i <= ORG_ROOT_COUNT; i++) {
    const rootId = `large-dept-${i}`;
    list.push({
      id: rootId,
      name: `事业部 ${String(i).padStart(2, '0')}`,
      parentId: null
    });
    for (let j = 1; j <= TEAMS_PER_ORG; j++) {
      list.push({
        id: `${rootId}-team-${j}`,
        name: `团队 ${i}-${String(j).padStart(2, '0')}`,
        parentId: rootId
      });
    }
  }
  return list;
};

const largeOrgList = buildLargeOrgList();
const orgNameMap = largeOrgList.reduce((map, item) => {
  map[item.id] = item.name;
  return map;
}, {});

const largeOrgListApi = {
  loader: () =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve({
          pageData: largeOrgList,
          totalCount: largeOrgList.length
        });
      }, 200);
    })
};

const largeUserListApi = {
  loader: ({ params } = {}) => {
    const perPage = Number(params?.perPage) || PAGE_SIZE;
    const currentPage = Number(params?.currentPage) || 1;
    const tenantOrgId = params?.filter?.tenantOrgId;

    return new Promise(resolve => {
      setTimeout(() => {
        if (!tenantOrgId) {
          resolve({ pageData: [], totalCount: 0 });
          return;
        }

        const orgName = orgNameMap[tenantOrgId] || '当前组织';
        const start = (currentPage - 1) * perPage;
        const pageData = Array.from({ length: Math.min(perPage, Math.max(TOTAL_USERS - start, 0)) }, (_, index) => {
          const order = start + index + 1;
          return {
            id: `large-user-${tenantOrgId}-${order}`,
            name: `成员 ${String(order).padStart(3, '0')}`,
            email: `member${order}@tech-innovation.com`,
            phone: `138${String(10000000 + order).slice(-8)}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=large-${tenantOrgId}-${order}`,
            position: POSITIONS[order % POSITIONS.length],
            department: orgName,
            tenantOrg: { id: tenantOrgId, name: orgName },
            status: 'open'
          };
        });

        resolve({
          pageData,
          totalCount: TOTAL_USERS
        });
      }, LOAD_DELAY_MS);
    });
  }
};

const TenantUserSelectLargeDataExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { Input } = FormInfo.fields;
  const { Text } = Typography;

  return (
    <PureGlobal preset={mockPreset}>
      <Flex vertical gap={16}>
        <Text type="secondary">
          模拟 {ORG_ROOT_COUNT} 个事业部、{ORG_ROOT_COUNT * TEAMS_PER_ORG} 个团队，共 {largeOrgList.length}{' '}
          个组织节点；每个组织下 {TOTAL_USERS} 名成员，每页加载 {PAGE_SIZE} 条。请先在左侧选择组织，再在右侧列表中向下滚动以触发加载更多。
        </Text>
        <Form
          onSubmit={data => {
            console.log('大规模成员选择:', data);
          }}>
          <FormInfo
            title="大规模成员选择"
            column={1}
            list={[<Input name="batchName" label="批次名称" rule="REQ" placeholder="例如：2026 Q2 全员培训" />]}
          />
          <TenantUserSelect
            name="participants"
            label="参训成员"
            rule="REQ"
            single={false}
            companyName="科技创新有限公司"
            orgApi={largeOrgListApi}
            userApi={largeUserListApi}
          />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <SubmitButton type="primary">保存</SubmitButton>
          </div>
        </Form>
      </Flex>
    </PureGlobal>
  );
});

render(<TenantUserSelectLargeDataExample />);
