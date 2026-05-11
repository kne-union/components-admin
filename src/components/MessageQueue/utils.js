const isPlainObject = value => Object.prototype.toString.call(value) === '[object Object]';

export const unwrapFilterValue = value => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    const list = value.map(item => unwrapFilterValue(item)).filter(item => item !== undefined);
    return list.length > 0 ? list : undefined;
  }

  if (isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, 'value')) {
    return unwrapFilterValue(value.value);
  }

  return value;
};

export const normalizeFilterValue = filterValue => {
  return Object.keys(filterValue || {}).reduce((result, key) => {
    const value = unwrapFilterValue(filterValue[key]);
    if (value !== undefined) {
      result[key] = value;
    }
    return result;
  }, {});
};

export const buildListParams = (filterValue, allowedKeys) => {
  const normalized = normalizeFilterValue(filterValue);
  return (allowedKeys || Object.keys(normalized)).reduce((result, key) => {
    if (normalized[key] !== undefined) {
      result[key] = normalized[key];
    }
    return result;
  }, {});
};

export const parseJsonInput = (value, fieldName, defaultValue = {}) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${fieldName} must be valid JSON`);
  }
};

export const parseNumberInput = (value, fieldName, defaultValue) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  return numberValue;
};

export const parseIsoDateTimeInput = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const dateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
  if (!dateTimePattern.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error(`${fieldName} must be a valid ISO date-time`);
  }

  return value;
};

export const stringifyJson = value => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value, null, 2);
};

export const formatRate = value => {
  const numberValue = Number(value || 0);
  return numberValue.toFixed(2);
};

export const formatPercent = value => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '-';
  }

  return `${(Number(value) * 100).toFixed(2)}%`;
};

export const buildUrlWithParams = (url, params = {}) => {
  const query = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  if (!query) {
    return url;
  }

  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
};

export const getMetricTotal = value => {
  if (!value) {
    return 0;
  }

  if (typeof value.total === 'number') {
    return value.total;
  }

  return Object.values(value.byTopic || {}).reduce((total, item) => total + Number(item || 0), 0);
};

export const filterPageData = ({ pageData = [], params = {}, filters = {} }) => {
  const normalizedParams = Object.assign({}, params, params.filter);
  const filtered = pageData.filter(item => {
    return Object.keys(filters).every(key => {
      const value = unwrapFilterValue(normalizedParams[key]);
      if (value === undefined) {
        return true;
      }
      return filters[key](item, value);
    });
  });
  const currentPage = Number(normalizedParams.currentPage || 1);
  const perPage = Number(normalizedParams.perPage || filtered.length || 20);
  const start = perPage * (currentPage - 1);

  return {
    pageData: filtered.slice(start, start + perPage),
    totalCount: filtered.length
  };
};
