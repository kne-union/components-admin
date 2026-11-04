// 示例内按租户保存 MFA 设置，刷新页面后重置
const stores = {};
const getStore = tenantId => {
  const key = tenantId || 'current';
  if (!stores[key]) {
    stores[key] = { enabled: false, methods: ['sms'], maxAge: 86400 };
  }
  return stores[key];
};

const createMfaSettingMock = () => ({
  detail: {
    loader: ({ params } = {}) => Object.assign({}, getStore(params?.tenantId))
  },
  save: {
    loader: ({ data } = {}) => {
      const { tenantId, ...values } = data || {};
      return Object.assign(getStore(tenantId), values);
    }
  }
});

export default createMfaSettingMock;
