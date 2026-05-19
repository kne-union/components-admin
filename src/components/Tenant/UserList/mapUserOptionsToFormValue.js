/** 从岗位列表接口响应中取出 pageData */
export function extractPositionPageData(response) {
  const body = response?.data?.results ?? response?.data?.data ?? response?.data;
  if (Array.isArray(body?.pageData)) {
    return body.pageData;
  }
  if (Array.isArray(body)) {
    return body;
  }
  return [];
}

/** SuperSelect object-output-value 回显需 { id, name } */
export function resolvePositionSelectValue(position, positionList = []) {
  if (position == null || position === '') {
    return null;
  }
  if (typeof position === 'object' && position.id != null) {
    const id = String(position.id);
    const name = position.name != null ? String(position.name).trim() : '';
    if (name) {
      return { id: position.id, name };
    }
    const hit = positionList.find(item => String(item.id) === id);
    return hit ? { id: hit.id, name: hit.name } : { id: position.id };
  }
  const id = String(position);
  const hit = positionList.find(item => String(item.id) === id);
  return hit ? { id: hit.id, name: hit.name } : { id: position };
}

/**
 * @param {Record<string, unknown> | null | undefined} options
 * @param {{ positionList?: { id: string, name: string }[] }} [context]
 */
const normalizeOptions = options => {
  if (options == null) {
    return options;
  }
  if (typeof options === 'string') {
    try {
      return JSON.parse(options);
    } catch {
      return options;
    }
  }
  return options;
};

export function mapUserOptionsToFormValue(options, { positionList = [] } = {}) {
  const normalized = normalizeOptions(options);
  if (!normalized || normalized.position == null) {
    return normalized;
  }
  const resolved = resolvePositionSelectValue(normalized.position, positionList);
  if (!resolved) {
    return normalized;
  }
  return Object.assign({}, normalized, { position: resolved });
}
