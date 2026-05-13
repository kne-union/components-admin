/** 浏览器 IANA 时区，传给 statistics 接口与 SSE，与后端「今日」划界一致 */
export const getClientIanaTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
};

const unwrapValue = value => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (Object.prototype.hasOwnProperty.call(value, 'value')) {
      return unwrapValue(value.value);
    }
    if (Object.prototype.hasOwnProperty.call(value, 'label')) {
      return unwrapValue(value.label);
    }
  }
  return value;
};

const isEmptyValue = value => value === undefined || value === null || value === '';

export const buildMessageParams = (filterValue = {}, filterKeys = []) => {
  return filterKeys.reduce((result, key) => {
    const value = unwrapValue(filterValue[key]);
    if (!isEmptyValue(value)) {
      result[`filter[${key}]`] = value;
    }
    return result;
  }, {});
};

export const filterMessagePageData = ({ pageData = [], params = {}, filters = {} }) => {
  const currentPage = Number(params.currentPage || 1);
  const perPage = Number(params.perPage || 20);
  const list = pageData.filter(item => {
    return Object.entries(filters).every(([key, filter]) => {
      const value = params[`filter[${key}]`];
      if (isEmptyValue(value)) {
        return true;
      }
      return filter(item, value);
    });
  });

  return {
    totalCount: list.length,
    currentPage,
    perPage,
    pageData: list.slice((currentPage - 1) * perPage, currentPage * perPage)
  };
};
