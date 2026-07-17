export const ALL_GROUP_VALUE = '__all__';

export const GROUP_COLORS = [
  { key: 'red', value: '#FF3B30' },
  { key: 'orange', value: '#FF9500' },
  { key: 'yellow', value: '#FFCC00' },
  { key: 'green', value: '#34C759' },
  { key: 'blue', value: '#007AFF' },
  { key: 'purple', value: '#AF52DE' },
  { key: 'gray', value: '#8E8E93' }
];

export const DEFAULT_GROUP_COLOR = '#007AFF';

/** 兼容 Fetch / ajax 返回的多种分组树数据结构 */
export const resolveGroupTreeData = data => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  if (Array.isArray(data?.results)) {
    return data.results;
  }
  if (Array.isArray(data?.pageData)) {
    return data.pageData;
  }
  return [];
};

export const flattenGroupTree = (nodes, parentId = null, valueKey = 'code') => {
  const result = [];
  (nodes || []).forEach(node => {
    const item = Object.assign({}, node, {
      parentId: parentId
    });
    delete item.children;
    result.push(item);
    if (node.children?.length) {
      const childParentKey = node[valueKey] ?? node.code ?? node.id;
      result.push(...flattenGroupTree(node.children, childParentKey, valueKey));
    }
  });
  return result;
};

export const findGroupInTree = (nodes, key, valueKey = 'code') => {
  for (const node of nodes || []) {
    if (String(node[valueKey]) === String(key) || String(node.id) === String(key) || String(node.code) === String(key)) {
      return node;
    }
    const child = findGroupInTree(node.children, key, valueKey);
    if (child) {
      return child;
    }
  }
  return null;
};

export const collectDescendantKeys = (node, valueKey = 'code') => {
  const keys = new Set();
  const walk = current => {
    if (!current) {
      return;
    }
    const key = current[valueKey] ?? current.id ?? current.code;
    if (key != null) {
      keys.add(String(key));
    }
    (current.children || []).forEach(walk);
  };
  walk(node);
  return keys;
};

export const normalizeGroupParentId = (value, valueKey = 'code') => {
  if (value == null || value === '' || value === ALL_GROUP_VALUE) {
    return null;
  }
  if (Array.isArray(value)) {
    return normalizeGroupParentId(value[0], valueKey);
  }
  if (typeof value === 'object') {
    const raw = value.id ?? value[valueKey] ?? value.value ?? value.code;
    if (raw == null || raw === '' || raw === ALL_GROUP_VALUE) {
      return null;
    }
    return raw;
  }
  return value;
};

export const getAllGroupOption = (label, valueKey = 'code') => ({
  [valueKey]: ALL_GROUP_VALUE,
  code: ALL_GROUP_VALUE,
  id: ALL_GROUP_VALUE,
  name: label,
  parentId: null
});

export const resolveGroupSelectValue = (rawValue, options = [], { valueKey = 'code', labelKey = 'name', allLabel } = {}) => {
  if (rawValue == null || rawValue === '' || rawValue === ALL_GROUP_VALUE) {
    return getAllGroupOption(allLabel, valueKey);
  }

  const normalized = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  if (normalized == null || normalized === '' || normalized === ALL_GROUP_VALUE) {
    return getAllGroupOption(allLabel, valueKey);
  }

  if (typeof normalized === 'object') {
    if (normalized[valueKey] === ALL_GROUP_VALUE || normalized.id === ALL_GROUP_VALUE || normalized.code === ALL_GROUP_VALUE) {
      return getAllGroupOption(allLabel || normalized[labelKey] || normalized.name, valueKey);
    }
    if (normalized[labelKey] || normalized.name) {
      return normalized;
    }
    return (
      options.find(
        option =>
          String(option[valueKey]) === String(normalized[valueKey] ?? normalized.id ?? normalized.code) ||
          String(option.id) === String(normalized.id)
      ) || normalized
    );
  }

  return (
    options.find(
      option =>
        String(option[valueKey]) === String(normalized) ||
        String(option.id) === String(normalized) ||
        String(option.code) === String(normalized)
    ) || null
  );
};

export const buildGroupSelectOptions = (treeData, { valueKey = 'code', allLabel, excludeKey } = {}) => {
  const excludeSet = excludeKey == null ? new Set() : collectDescendantKeys(findGroupInTree(treeData, excludeKey, valueKey), valueKey);
  const flat = flattenGroupTree(treeData, null, valueKey).filter(item => {
    const key = item[valueKey] ?? item.id ?? item.code;
    return key == null || !excludeSet.has(String(key));
  });
  return [getAllGroupOption(allLabel, valueKey), ...flat];
};
