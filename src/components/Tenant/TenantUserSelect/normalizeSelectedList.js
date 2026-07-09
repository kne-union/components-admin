const normalizeSelectedList = (value, single) => {
  if (!value) {
    return [];
  }
  if (single) {
    return value.id != null ? [value] : [];
  }
  return Array.isArray(value) ? value : [];
};

export default normalizeSelectedList;
