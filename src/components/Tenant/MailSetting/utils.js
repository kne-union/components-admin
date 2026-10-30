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

export const toSmtpFormData = data => ({
  enabled: data?.configured ? data.enabled !== false : true,
  host: data?.host,
  port: data?.port || 465,
  secure: data?.configured ? data.secure !== false : true,
  user: data?.user,
  fromName: data?.fromName,
  fromAddress: data?.fromAddress
});
