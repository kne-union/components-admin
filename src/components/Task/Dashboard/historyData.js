import { sanitizeStatisticsDurationMs } from './constants';

export const COMPLETED_STATUS_LIST = ['success', 'failed', 'canceled'];

/** 与 fastify-task 分桶规则一致：旧版后端未返回 granularity / buckets 时按此在本地补齐 */
export const RANGE_GRANULARITY = { '7d': 'day', '1m': 'day', '3m': 'week', '1y': 'month' };
const RANGE_BUCKET_COUNT = { '7d': 7, '1m': 30, '3m': 13, '1y': 12 };

const pad = n => String(n).padStart(2, '0');
const formatDay = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDay = key => {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const startOfBucket = (date, granularity) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (granularity === 'month') d.setDate(1);
  if (granularity === 'week') d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};

const addBuckets = (date, granularity, n) => {
  const d = new Date(date);
  if (granularity === 'month') d.setMonth(d.getMonth() + n);
  else d.setDate(d.getDate() + n * (granularity === 'week' ? 7 : 1));
  return d;
};

const keyOfDate = (date, granularity) => (granularity === 'month' ? formatDay(date).slice(0, 7) : formatDay(date));

export const toBucketKey = (date, granularity) => {
  const value = String(date || '');
  if (granularity === 'month') return value.slice(0, 7);
  if (granularity === 'week') return formatDay(startOfBucket(parseDay(value.slice(0, 10)), 'week'));
  return value.slice(0, 10);
};

export const resolveBuckets = (data, range) => {
  const granularity = data?.granularity || RANGE_GRANULARITY[range] || 'day';
  if (Array.isArray(data?.buckets) && data.buckets.length > 0) {
    return { granularity, keys: data.buckets.map(b => b.key) };
  }
  const count = RANGE_BUCKET_COUNT[range] || 7;
  const first = addBuckets(startOfBucket(new Date(), granularity), granularity, -(count - 1));
  return {
    granularity,
    keys: Array.from({ length: count }, (_, i) => keyOfDate(addBuckets(first, granularity, i), granularity))
  };
};

export const formatBucketAxisLabel = (key, granularity) => (granularity === 'month' ? key : key.slice(5));

export const formatBucketTitle = (key, granularity) => {
  if (granularity !== 'week') return key;
  const end = addBuckets(parseDay(key), 'week', 1);
  end.setDate(end.getDate() - 1);
  return `${key} ~ ${formatDay(end)}`;
};

export const formatRangeCaption = (keys, granularity) => {
  if (!keys.length) return '';
  const first = granularity === 'month' ? `${keys[0]}-01` : keys[0];
  return `${first} ~ ${formatDay(new Date())}`;
};

/** items 按 bucket key 累加到与 keys 对齐的数组 */
const sumIntoBuckets = (keys, granularity, items, getValue) => {
  const indexMap = new Map(keys.map((key, i) => [key, i]));
  const values = keys.map(() => 0);
  items.forEach(item => {
    const index = indexMap.get(toBucketKey(item.date, granularity));
    if (index === undefined) return;
    values[index] += getValue(item);
  });
  return values;
};

export const buildStatusSeries = (data, keys, granularity) => {
  const rows = data?.recentTrendByStatus || [];
  return COMPLETED_STATUS_LIST.reduce((acc, status) => {
    acc[status] = sumIntoBuckets(
      keys,
      granularity,
      rows.filter(item => item.status === status),
      item => Number(item.count) || 0
    );
    return acc;
  }, {});
};

export const buildTypeSeries = (data, keys, granularity) => {
  const rows = data?.recentTrendByType || [];
  const types = Array.from(new Set(rows.map(item => String(item.type)))).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
  return types
    .map(type => ({
      type,
      values: sumIntoBuckets(
        keys,
        granularity,
        rows.filter(item => String(item.type) === type),
        item => Number(item.count) || 0
      )
    }))
    .filter(({ values }) => values.some(v => v > 0));
};

const createDurationAcc = () => ({ weight: 0, waiting: 0, execution: 0, total: 0 });

const accumulateDuration = (acc, item) => {
  if (!item || typeof item !== 'object') return;
  const waiting = sanitizeStatisticsDurationMs(item.avgWaitingTime);
  const execution = sanitizeStatisticsDurationMs(item.avgExecutionTime);
  const total = sanitizeStatisticsDurationMs(item.avgTotalTime);
  const count = Number(item.count ?? item.completedCount) || 0;
  const weight = count > 0 ? count : waiting || execution ? 1 : 0;
  if (weight <= 0) return;
  acc.weight += weight;
  acc.waiting += (waiting || 0) * weight;
  acc.execution += (execution || 0) * weight;
  acc.total += (total || 0) * weight;
};

const toDurationResult = acc =>
  acc.weight > 0
    ? {
        count: acc.weight,
        avgWaitingTime: acc.waiting / acc.weight,
        avgExecutionTime: acc.execution / acc.weight,
        avgTotalTime: acc.total / acc.weight
      }
    : null;

const durationOf = item => {
  const acc = createDurationAcc();
  accumulateDuration(acc, item);
  return toDurationResult(acc);
};

/** 某个 durationTrend 条目在「执行方式 + 任务类型」筛选下的耗时切片 */
const pickDurationSlices = (item, runnerMode, types) => {
  if (runnerMode === 'all') {
    return types.length > 0 ? types.map(type => item?.byType?.[type]) : [item];
  }
  return types.length > 0 ? types.map(type => item?.byTypeByRunnerType?.[runnerMode]?.[type]) : [item?.byRunnerType?.[runnerMode]];
};

export const buildDurationSeries = (data, keys, granularity, runnerMode, types = []) => {
  const indexMap = new Map(keys.map((key, i) => [key, i]));
  const accs = keys.map(createDurationAcc);
  (data?.durationTrend || []).forEach(item => {
    const index = indexMap.get(toBucketKey(item.date, granularity));
    if (index === undefined) return;
    pickDurationSlices(item, runnerMode, types).forEach(slice => accumulateDuration(accs[index], slice));
  });
  return accs.map(toDurationResult);
};

export const getDurationTaskTypes = (data, runnerMode) => {
  const set = new Set();
  (data?.durationTrend || []).forEach(item => {
    const source = runnerMode === 'all' ? item?.byType : item?.byTypeByRunnerType?.[runnerMode];
    Object.keys(source || {}).forEach(type => set.add(String(type)));
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
};

/** 范围内各任务类型耗时：优先后端 duration 汇总，旧版后端按 durationTrend 加权回算 */
export const buildDurationByType = (data, runnerMode) => {
  const summary = data?.duration;
  const fromSummary = runnerMode === 'all' ? summary?.byType : summary?.byTypeByRunnerType?.[runnerMode];
  if (fromSummary && typeof fromSummary === 'object' && Object.keys(fromSummary).length > 0) {
    return Object.entries(fromSummary)
      .map(([type, item]) => ({ type, ...durationOf(item) }))
      .filter(item => item.count > 0);
  }
  const accMap = {};
  (data?.durationTrend || []).forEach(item => {
    const source = runnerMode === 'all' ? item?.byType : item?.byTypeByRunnerType?.[runnerMode];
    Object.entries(source || {}).forEach(([type, slice]) => {
      if (!accMap[type]) accMap[type] = createDurationAcc();
      accumulateDuration(accMap[type], slice);
    });
  });
  return Object.entries(accMap)
    .map(([type, acc]) => ({ type, ...toDurationResult(acc) }))
    .filter(item => item.count > 0);
};

/** 范围内整体耗时：优先后端 duration，否则按 durationTrend 加权 */
export const buildDurationSummary = data => {
  if (data?.duration && Number(data.duration.completedCount) > 0) return durationOf(data.duration);
  const acc = createDurationAcc();
  (data?.durationTrend || []).forEach(item => accumulateDuration(acc, item));
  return toDurationResult(acc);
};

/** 完成时段热力图：cells[weekday][hour]，weekday 0 = 周一 */
export const buildHourHeatmap = data => {
  const cells = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ total: 0, success: 0, failed: 0, canceled: 0 })));
  (data?.hourlyCompletionTrend || []).forEach(row => {
    const hour = Number(row?.hour);
    if (!Number.isInteger(hour) || hour < 0 || hour >= 24 || !row?.date) return;
    const weekday = (parseDay(String(row.date).slice(0, 10)).getDay() + 6) % 7;
    const cell = cells[weekday][hour];
    cell.total += Number(row.totalCompleted) || 0;
    cell.success += Number(row.successCount) || 0;
    cell.failed += Number(row.failedCount) || 0;
    cell.canceled += Number(row.canceledCount) || 0;
  });
  return cells;
};

/** 小时级统计只保留当月：范围起点早于本月 1 日时，热力图只覆盖部分范围 */
export const isHourlyPartial = (keys, granularity) => {
  if (!keys.length) return false;
  const first = parseDay(granularity === 'month' ? `${keys[0]}-01` : keys[0]);
  const monthStart = new Date();
  monthStart.setHours(0, 0, 0, 0);
  monthStart.setDate(1);
  return first < monthStart;
};
