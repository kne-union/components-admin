import { transform } from 'lodash';

const FILTER_KEYS = ['id', 'targetId', 'type', 'status', 'runnerType', 'targetName', 'createdAt', 'completedAt'];

const isDateRangeArray = value =>
  Array.isArray(value) &&
  value.length === 2 &&
  (value[0] != null || value[1] != null) &&
  !value.some(item => item && typeof item === 'object' && ('value' in item || 'id' in item));

const toTimeString = value => {
  if (value == null || value === '') {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value.toISOString === 'function') {
    return value.toISOString();
  }
  return value;
};

export const unwrapFilterField = raw => {
  if (raw == null || raw === '') {
    return undefined;
  }
  if (isDateRangeArray(raw)) {
    return raw;
  }
  if (Array.isArray(raw)) {
    return unwrapFilterField(raw[0]);
  }
  if (typeof raw === 'object') {
    if (isDateRangeArray(raw.value)) {
      return raw.value;
    }
    if (raw.value != null && raw.value !== '' && typeof raw.value !== 'object') {
      return raw.value;
    }
    if (raw.id != null && raw.id !== '') {
      return raw.id;
    }
    return undefined;
  }
  return raw;
};

export const formatDateRangeFilter = rawValue => {
  const range = unwrapFilterField(rawValue);
  if (!isDateRangeArray(range)) {
    return null;
  }
  if (!range[0] && !range[1]) {
    return null;
  }
  return {
    startTime: toTimeString(range[0]),
    endTime: toTimeString(range[1])
  };
};

export const createTaskMapFilterValue =
  ({ sort, fixedFilter } = {}) =>
  (filterValue, getFilterValue) => {
    const items = Array.isArray(filterValue) ? filterValue : [];
    const raw = typeof getFilterValue === 'function' ? getFilterValue(items) || {} : {};
    const nextFilter = {};

    ['id', 'targetId', 'type', 'status', 'runnerType', 'targetName'].forEach(key => {
      const entry = items.find(item => item && item.name === key);
      const scalar = unwrapFilterField(raw[key] != null ? raw[key] : entry && entry.value);
      nextFilter[key] = scalar !== undefined && scalar !== '' ? scalar : null;
    });

    ['createdAt', 'completedAt'].forEach(key => {
      const entry = items.find(item => item && item.name === key);
      nextFilter[key] = formatDateRangeFilter(raw[key] != null ? raw[key] : entry && entry.value);
    });

    Object.assign(nextFilter, fixedFilter);

    FILTER_KEYS.forEach(key => {
      if (nextFilter[key] === undefined) {
        nextFilter[key] = null;
      }
    });

    return {
      filter: nextFilter,
      sort: transform(
        sort,
        (result, value) => {
          result[value.name] = value.sort;
        },
        {}
      )
    };
  };
