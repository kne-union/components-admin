const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);

const isOpenApiPath = path => typeof path === 'string' && (path.includes('/open-api/') || path.includes('/open-data/'));

/** 从 swagger（GET /open-api.json）过滤 open-api / open-data 路径，生成 SuperSelect 选项 */
export const buildOpenApiScopeOptions = swaggerDoc => {
  const paths = swaggerDoc?.paths || {};
  const pageData = [];
  Object.keys(paths).forEach(path => {
    if (!isOpenApiPath(path)) {
      return;
    }
    const item = paths[path] || {};
    Object.keys(item).forEach(method => {
      const lower = method.toLowerCase();
      if (!HTTP_METHODS.has(lower)) {
        return;
      }
      const op = item[method];
      if (!op || typeof op !== 'object') {
        return;
      }
      const m = lower.toUpperCase();
      const summary = op.summary || op.operationId || '';
      const value = `${m} ${path}`;
      pageData.push({
        value,
        label: summary ? `${value} — ${summary}` : value
      });
    });
  });
  pageData.sort((a, b) => a.value.localeCompare(b.value));
  return pageData;
};

export const scopesToFormValue = scopes => {
  if (!Array.isArray(scopes) || scopes.length === 0) {
    return [];
  }
  return scopes.map(item => {
    const method = String(item?.method || '')
      .trim()
      .toUpperCase();
    const path = String(item?.path || '').trim();
    const value = `${method} ${path}`;
    return { value, label: value };
  });
};

export const formValueToScopes = selected => {
  if (!Array.isArray(selected) || selected.length === 0) {
    return null;
  }
  return selected
    .map(item => {
      const value = typeof item === 'string' ? item : item?.value;
      if (!value || typeof value !== 'string') {
        return null;
      }
      const space = value.indexOf(' ');
      if (space < 0) {
        return null;
      }
      return {
        method: value.slice(0, space).toUpperCase(),
        path: value.slice(space + 1).trim()
      };
    })
    .filter(item => item && item.method && item.path);
};
