const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);

const METHOD_TAG_COLOR = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  PATCH: 'geekblue',
  DELETE: 'red',
  HEAD: 'default',
  OPTIONS: 'default'
};

const isOpenApiPath = path => typeof path === 'string' && (path.includes('/open-api/') || path.includes('/open-data/'));

export const getMethodTagColor = method => METHOD_TAG_COLOR[String(method || '').toUpperCase()] || 'default';

/** 作用域选项本地搜索：匹配 method / path / summary / label / value */
export const matchOpenApiScopeOption = (item, searchText) => {
  if (!searchText) {
    return true;
  }
  const keyword = String(searchText).toLowerCase();
  return [item?.method, item?.path, item?.description, item?.label, item?.value]
    .filter(Boolean)
    .some(text => String(text).toLowerCase().includes(keyword));
};

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
        method: m,
        path,
        description: summary || undefined,
        // 已选 Tag 文案；列表项由 renderItemContent 自定义
        label: summary ? `${m} ${path} — ${summary}` : `${m} ${path}`
      });
    });
  });
  pageData.sort((a, b) => a.value.localeCompare(b.value));
  return pageData;
};

const scopeKey = (method, path) => `${String(method || '').toUpperCase()} ${String(path || '').trim()}`;

const HTTP_METHOD_KEYS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);

/**
 * 按密钥 scopes 裁剪 OpenAPI 文档，供 PostCat OpenApiView 展示。
 * scopes 为空 → 保留全部 /open-api/|/open-data/ 路径；有 scopes → 仅保留命中的 method+path。
 */
export const filterOpenApiDocByScopes = (swaggerDoc, scopes) => {
  const doc = swaggerDoc && typeof swaggerDoc === 'object' ? { ...swaggerDoc, paths: { ...(swaggerDoc.paths || {}) } } : { paths: {} };
  const list = Array.isArray(scopes) ? scopes : [];
  const isAll = list.length === 0;
  const allow = isAll
    ? null
    : new Set(
        list.map(item =>
          scopeKey(
            String(item?.method || '')
              .trim()
              .toUpperCase(),
            String(item?.path || '').trim()
          )
        )
      );

  const nextPaths = {};
  Object.keys(doc.paths || {}).forEach(path => {
    if (!isOpenApiPath(path)) {
      return;
    }
    const item = doc.paths[path];
    if (!item || typeof item !== 'object') {
      return;
    }
    if (isAll) {
      nextPaths[path] = item;
      return;
    }
    const filtered = {};
    Object.keys(item).forEach(key => {
      const lower = key.toLowerCase();
      if (!HTTP_METHOD_KEYS.has(lower)) {
        // 保留 parameters 等 path 级字段，仅当该 path 下至少有一个 method 命中时再挂上
        return;
      }
      if (allow.has(scopeKey(lower.toUpperCase(), path))) {
        filtered[key] = item[key];
      }
    });
    if (Object.keys(filtered).length) {
      // 带上 path 级非 method 字段（如 parameters）
      Object.keys(item).forEach(key => {
        if (!HTTP_METHOD_KEYS.has(key.toLowerCase()) && filtered[key] === undefined) {
          filtered[key] = item[key];
        }
      });
      nextPaths[path] = filtered;
    }
  });

  doc.paths = nextPaths;
  return doc;
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
    return {
      value,
      method,
      path,
      label: value
    };
  });
};

export const formValueToScopes = selected => {
  if (!Array.isArray(selected) || selected.length === 0) {
    return null;
  }
  return selected
    .map(item => {
      if (item && typeof item === 'object' && item.method && item.path) {
        return {
          method: String(item.method).trim().toUpperCase(),
          path: String(item.path).trim()
        };
      }
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
