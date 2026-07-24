export const DEFAULT_GROUP_PERMISSIONS = ['add', 'edit', 'delete'];

export const resolveGroupPermissions = (
  permissions,
  { hasAddApi = false, hasEditApi = false, hasRemoveApi = false, manageable = true } = {}
) => {
  if (manageable === false) {
    return { showAdd: false, showEdit: false, showDelete: false };
  }
  const list = Array.isArray(permissions) ? permissions : DEFAULT_GROUP_PERMISSIONS;
  return {
    showAdd: list.includes('add') && hasAddApi,
    showEdit: list.includes('edit') && hasEditApi,
    showDelete: list.includes('delete') && hasRemoveApi
  };
};

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

/** 分组颜色存在 options.color，兼容历史顶层 color */
export const getGroupColor = item => item?.color ?? item?.options?.color;

/** 表单 color → 持久化到 options.color */
export const applyGroupColorToPayload = (payload, { color, existingOptions } = {}) => {
  const next = Object.assign({}, payload);
  const resolvedColor = color ?? next.color;
  delete next.color;
  if (resolvedColor == null || resolvedColor === '') {
    return next;
  }
  next.options = Object.assign({}, existingOptions, next.options, { color: resolvedColor });
  return next;
};

const hoistGroupColor = nodes =>
  (nodes || []).map(node => {
    const next = Object.assign({}, node, {
      color: getGroupColor(node)
    });
    if (node.children?.length) {
      next.children = hoistGroupColor(node.children);
    }
    return next;
  });

/** 兼容 Fetch / ajax 返回的多种分组树数据结构 */
export const resolveGroupTreeData = data => {
  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data?.data)) {
    list = data.data;
  } else if (Array.isArray(data?.results)) {
    list = data.results;
  } else if (Array.isArray(data?.pageData)) {
    list = data.pageData;
  }
  return hoistGroupColor(list);
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

/** 「全部 / 无父级」选项：用 isAll 标记，不用假 code */
export const getAllGroupOption = (label, valueKey = 'code') => ({
  [valueKey]: null,
  code: null,
  id: null,
  name: label,
  parentId: null,
  isAll: true
});

export const isAllGroupOption = (item, valueKey = 'code') => {
  if (item == null || item === '') {
    return true;
  }
  if (typeof item !== 'object') {
    return false;
  }
  if (item.isAll) {
    return true;
  }
  return item[valueKey] == null && item.id == null && item.code == null;
};

export const normalizeGroupParentId = (value, valueKey = 'code') => {
  if (value == null || value === '') {
    return null;
  }
  if (Array.isArray(value)) {
    return normalizeGroupParentId(value[0], valueKey);
  }
  if (typeof value === 'object') {
    if (isAllGroupOption(value, valueKey)) {
      return null;
    }
    const raw = value.id ?? value[valueKey] ?? value.value ?? value.code;
    if (raw == null || raw === '') {
      return null;
    }
    return raw;
  }
  return value;
};

export const resolveGroupSelectValue = (rawValue, options = [], { valueKey = 'code', labelKey = 'name', allLabel } = {}) => {
  if (isAllGroupOption(rawValue, valueKey)) {
    return getAllGroupOption(allLabel, valueKey);
  }

  const normalized = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  if (isAllGroupOption(normalized, valueKey)) {
    return getAllGroupOption(allLabel, valueKey);
  }

  if (typeof normalized === 'object') {
    if (normalized[labelKey] || normalized.name) {
      return normalized;
    }
    return (
      options.find(
        option =>
          !isAllGroupOption(option, valueKey) &&
          (String(option[valueKey]) === String(normalized[valueKey] ?? normalized.id ?? normalized.code) ||
            String(option.id) === String(normalized.id))
      ) || normalized
    );
  }

  return (
    options.find(
      option =>
        !isAllGroupOption(option, valueKey) &&
        (String(option[valueKey]) === String(normalized) ||
          String(option.id) === String(normalized) ||
          String(option.code) === String(normalized))
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

/** 将父级选择值解析为后端需要的 id（优先 id）；无父级时返回 null，禁止传 "" */
export const resolveGroupParentIdForSave = (value, treeData = [], valueKey = 'code') => {
  const raw = normalizeGroupParentId(value, valueKey);
  if (raw == null || raw === '') {
    return null;
  }
  if (!treeData?.length) {
    return raw;
  }
  const node = findGroupInTree(treeData, raw, valueKey);
  const id = node?.id != null ? node.id : raw;
  return id === '' ? null : id;
};

/** 表单自定义规则：校验编码在同 type/language 下唯一 */
export const createGroupCodeUniqueChecker = ({
  ajax,
  api,
  type,
  language,
  valueKey = 'code',
  duplicateMessage = '编码已存在'
} = {}) => {
  return async value => {
    if (!value || !ajax || !api) {
      return { result: true };
    }
    try {
      const { data: resData } = await ajax(
        Object.assign({}, api, {
          params: Object.assign({}, api.params, { type, language, output: 'list' })
        })
      );
      const raw = resData?.code === 0 ? resData.data : resData;
      const list = resolveGroupTreeData(raw);
      const flat = list.some(item => item?.children?.length) ? flattenGroupTree(list, null, valueKey) : list;
      const exists = flat.some(item => String(item.code) === String(value));
      return {
        result: !exists,
        errMsg: duplicateMessage
      };
    } catch (e) {
      return { result: true };
    }
  };
};
