const pickSelectValues = value => {
  if (value == null || value === '') {
    return [];
  }
  const list = Array.isArray(value) ? value : [value];
  return list
    .map(item => {
      if (item == null) {
        return null;
      }
      if (typeof item !== 'object') {
        return String(item);
      }
      if (item.value != null && item.value !== '') {
        return String(item.value);
      }
      if (item.id != null && item.id !== '') {
        return String(item.id);
      }
      return null;
    })
    .filter(Boolean);
};

/**
 * AdvancedSelectFilterItem 筛选项为 { label, value }，
 * Filter.getFilterValue 可能无法正确写入 filter.type，需在此补全。
 */
const getRoleListFilterValue = (filter, getFilterValue) => {
  const value = getFilterValue(filter);

  const typeEntry = filter.find(item => item.name === 'type');
  if (typeEntry) {
    const types = pickSelectValues(typeEntry.value);
    if (types.length) {
      value.type = types[0];
    } else {
      delete value.type;
    }
  } else if (value.type != null && typeof value.type === 'object') {
    const types = pickSelectValues(value.type);
    if (types.length) {
      value.type = types[0];
    } else {
      delete value.type;
    }
  }

  return value;
};

export default getRoleListFilterValue;
