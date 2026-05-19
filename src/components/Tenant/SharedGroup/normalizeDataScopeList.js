const DEFAULT_DATA_SCOPE_LIST = ['read', 'write'];

/**
 * dataScope.list 未配置或为空时默认为 ['read', 'write']。
 *
 * @param {unknown} list
 * @returns {('read' | 'write')[]}
 */
export function normalizeDataScopeList(list) {
  if (!Array.isArray(list) || !list.length) {
    return [...DEFAULT_DATA_SCOPE_LIST];
  }
  const out = [];
  const seen = new Set();
  for (const item of list) {
    if ((item === 'read' || item === 'write') && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out.length ? out : [...DEFAULT_DATA_SCOPE_LIST];
}
