const { UserList } = _Tenant;
const { default: mockPreset, ...rest } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

/**
 * 插件扩展示例：
 * 通过 plugins.tenantAdmin 注册扩展点，为用户列表增加自定义字段。
 *
 * 四个扩展点：
 * 1. UserFormInner - 替换用户创建/编辑表单，在默认字段基础上插入自定义字段
 * 2. getUserListColumns - 扩展用户列表表格列，插入自定义列
 * 3. personalCard - 增强 PersonalCard 的 moreInfo 展示，插入自定义信息项
 * 4. getUserApis - 提供额外的 API 端点（如岗位列表接口）
 */

// 模拟岗位列表数据
const mockPositionList = [
  { id: 'pos-1', name: '前端工程师' },
  { id: 'pos-2', name: '产品经理' },
  { id: 'pos-3', name: 'UI设计师' }
];

// 扩展点 1：自定义用户表单（在默认字段基础上插入岗位选择器）
const UserFormInnerPlugin = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, list, apis, ...props }) => {
  const [FormInfo] = remoteModules;
  const { SuperSelect } = FormInfo.fields;
  const newList = list.slice(0);
  // 在第 3 个位置插入岗位选择字段
  newList.splice(2, 0, (
    <SuperSelect
      name="options.position"
      label="岗位"
      rule="REQ"
      labelKey="name"
      valueKey="id"
      interceptor="object-output-value"
      single
      api={{
        loader: () => ({
          pageData: mockPositionList
        })
      }}
    />
  ));
  return <FormInfo {...props} list={newList} />;
});

// 扩展点 2：扩展用户列表列（插入岗位列）
const getUserListColumns = ({ columns }) => {
  const newColumns = columns.slice(0);
  newColumns.splice(7, 0, {
    title: '岗位',
    name: 'options.position',
    type: 'other',
    valueOf: item => {
      const raw = item?.options?.position;
      if (!raw) return '-';
      if (typeof raw === 'object' && raw.name) return raw.name;
      const hit = mockPositionList.find(p => String(p.id) === String(raw));
      return hit ? hit.name : raw;
    }
  });
  return newColumns;
};

// 扩展点 3：增强 PersonalCard 展示（插入岗位信息）
const personalCard = ({ moreInfo, data }) => {
  if (moreInfo.some(item => item.key === 'position')) {
    return moreInfo;
  }
  const raw = data?.options?.position;
  if (!raw) return moreInfo;
  const positionName = typeof raw === 'object' && raw.name ? raw.name : (
    mockPositionList.find(p => String(p.id) === String(raw))?.name || raw
  );
  if (!positionName) return moreInfo;
  const rolesIndex = moreInfo.findIndex(item => item.key === 'roles');
  const next = moreInfo.slice();
  next.splice(rolesIndex + 1, 0, {
    key: 'position',
    label: '岗位',
    content: positionName
  });
  return next;
};

// 扩展点 4：提供额外 API
const getUserApis = () => ({
  positionList: {
    loader: () => ({ pageData: mockPositionList })
  }
});

// 构造带插件的 preset
const presetWithPlugins = Object.assign({}, mockPreset, {
  plugins: Object.assign({}, mockPreset.plugins || {}, {
    tenantAdmin: Object.assign({}, mockPreset.plugins?.tenantAdmin || {}, {
      UserFormInner: UserFormInnerPlugin,
      getUserListColumns,
      personalCard,
      getUserApis
    })
  })
});

const PluginExtensionExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={presetWithPlugins}>
      <Layout navigation={{ isFixed: false }}>
        <UserList
          apis={{
            list: mockPreset.apis.tenant.getUserList,
            create: mockPreset.apis.tenant.createUser,
            save: mockPreset.apis.tenant.saveUser,
            remove: mockPreset.apis.tenant.removeUser,
            roleList: mockPreset.apis.tenant.getRoleList,
            orgList: mockPreset.apis.tenant.orgList
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<PluginExtensionExample />);
