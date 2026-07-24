const toFieldItem = (item, valueKey, labelKey) => {
  if (!item) {
    return null;
  }
  if (item[valueKey] != null || item[labelKey] != null) {
    return item;
  }
  if (item.value != null) {
    return {
      [valueKey]: item.value,
      [labelKey]: item.label,
      code: item.value,
      name: item.label,
      id: item.id
    };
  }
  return item;
};

const toLabelValue = (item, valueKey, labelKey) => {
  if (!item) {
    return null;
  }
  return {
    label: item[labelKey] ?? item.name ?? item.label,
    value: item[valueKey] ?? item.code ?? item.id ?? item.value
  };
};

/** GroupSelect / GroupFolder：{code,name} ↔ Filter 的 {label,value} */
export const createGroupSelectInterceptor = ({ single = false, valueKey = 'code', labelKey = 'name' } = {}) => {
  if (single) {
    return {
      input: value => {
        if (!value) {
          return value;
        }
        const item = Array.isArray(value) ? value[0] : value;
        return toFieldItem(item, valueKey, labelKey);
      },
      output: selected => {
        if (!selected) {
          return selected;
        }
        const item = Array.isArray(selected) ? selected[0] : selected;
        return toLabelValue(item, valueKey, labelKey);
      }
    };
  }

  return {
    input: value => {
      if (!value) {
        return value;
      }
      const list = Array.isArray(value) ? value : [value];
      return list.map(item => toFieldItem(item, valueKey, labelKey)).filter(Boolean);
    },
    output: selected => {
      if (!selected) {
        return selected;
      }
      const list = Array.isArray(selected) ? selected : [selected];
      return list.map(item => toLabelValue(item, valueKey, labelKey)).filter(Boolean);
    }
  };
};
