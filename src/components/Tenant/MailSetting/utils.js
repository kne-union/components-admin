/** 合并请求参数；传 tenantId 时（admin 端）一并带上 */
export const createRequest = (api, tenantId, payload) => {
  const values = Object.assign({}, payload, tenantId ? { tenantId } : null);
  const isGet = !api.method || String(api.method).toUpperCase() === 'GET';
  return Object.assign({}, api, isGet ? { params: Object.assign({}, api.params, values) } : { data: Object.assign({}, api.data, values) });
};

export const toSmtpPayload = formData => ({
  enabled: formData.enabled !== false,
  host: formData.host,
  port: Number(formData.port) || 465,
  secure: formData.secure !== false,
  user: formData.user,
  pass: formData.pass || undefined,
  fromName: formData.fromName || '',
  fromAddress: formData.fromAddress || ''
});

/** 按模版名称或编码过滤（不区分大小写） */
export const filterTemplates = (list, keyword) => {
  const value = String(keyword || '')
    .trim()
    .toLowerCase();
  const items = Array.isArray(list) ? list : [];
  return value
    ? items.filter(item =>
        [item.name, item.code].some(text =>
          String(text || '')
            .toLowerCase()
            .includes(value)
        )
      )
    : items;
};

/** 取单选筛选值：兼容原始值、数组与 { value } 对象 */
export const getFilterValue = value => {
  const item = Array.isArray(value) ? value[0] : value;
  return item && typeof item === 'object' ? item.value : item;
};

/** 按模版类型过滤，type 为空时不过滤 */
export const filterTemplatesByType = (list, type) => {
  const value = getFilterValue(type);
  const items = Array.isArray(list) ? list : [];
  return value === undefined || value === null || value === '' ? items : items.filter(item => Number(item.type || 0) === Number(value));
};

/** 影响 SMTP 连接的字段指纹；测试通过后这些字段变化需要重新测试 */
export const getSmtpConnectionKey = formData => {
  const { host, port, secure, user, pass } = toSmtpPayload(formData || {});
  return JSON.stringify([(host || '').trim(), port, secure, (user || '').trim(), pass || '']);
};

/**
 * 启用租户 SMTP 时，连接参数须测试通过才能保存；
 * 连接参数与已保存配置一致（如只改发件人名称）视为已验证
 * @returns {'ready'|'passed'|'required'|'outdated'}
 */
export const getSmtpSaveState = ({ formData, testedKey, savedKey }) => {
  if (formData?.enabled === false) {
    return 'ready';
  }
  const key = getSmtpConnectionKey(formData);
  if (testedKey && key === testedKey) {
    return 'passed';
  }
  if (key === savedKey) {
    return 'ready';
  }
  return testedKey ? 'outdated' : 'required';
};

export const toSmtpFormData = data => ({
  enabled: data?.configured ? data.enabled !== false : true,
  host: data?.host,
  port: data?.port || 465,
  secure: data?.configured ? data.secure !== false : true,
  user: data?.user,
  fromName: data?.fromName,
  fromAddress: data?.fromAddress
});
