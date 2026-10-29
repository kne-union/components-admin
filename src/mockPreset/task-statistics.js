const RANGE_CONFIG = {
  '7d': { granularity: 'day', count: 7, label: '近7天' },
  '1m': { granularity: 'day', count: 30, label: '近1个月' },
  '3m': { granularity: 'week', count: 13, label: '近3个月' },
  '1y': { granularity: 'month', count: 12, label: '近1年' }
};

const BUCKET_DAYS = { day: 1, week: 7, month: 30 };
const TASK_TYPES = ['export', 'import'];
const RUNNER_TYPES = ['manual', 'system'];

const pad = n => String(n).padStart(2, '0');
const formatDay = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const buildBuckets = ({ granularity, count }) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (granularity === 'month') start.setDate(1);
  if (granularity === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: count }, (_, i) => {
    const offset = i - (count - 1);
    const bucketStart = new Date(start);
    const bucketEnd = new Date(start);
    if (granularity === 'month') {
      bucketStart.setMonth(bucketStart.getMonth() + offset);
      bucketEnd.setMonth(bucketEnd.getMonth() + offset + 1);
    } else {
      const step = granularity === 'week' ? 7 : 1;
      bucketStart.setDate(bucketStart.getDate() + offset * step);
      bucketEnd.setDate(bucketEnd.getDate() + (offset + 1) * step);
    }
    const key = granularity === 'month' ? formatDay(bucketStart).slice(0, 7) : formatDay(bucketStart);
    return { key, start: bucketStart.toISOString(), end: (i === count - 1 ? now : bucketEnd).toISOString() };
  });
};

const randomDuration = () => {
  const avgWaitingTime = random(500, 3500);
  const avgExecutionTime = random(2000, 10000);
  return { avgWaitingTime, avgExecutionTime, avgTotalTime: avgWaitingTime + avgExecutionTime };
};

const createAcc = () => ({ count: 0, waiting: 0, execution: 0, total: 0 });
const addAcc = (acc, { count, avgWaitingTime, avgExecutionTime, avgTotalTime }) => {
  acc.count += count;
  acc.waiting += avgWaitingTime * count;
  acc.execution += avgExecutionTime * count;
  acc.total += avgTotalTime * count;
};
const toAvg = acc => ({
  count: acc.count,
  avgWaitingTime: acc.count ? Math.round(acc.waiting / acc.count) : 0,
  avgExecutionTime: acc.count ? Math.round(acc.execution / acc.count) : 0,
  avgTotalTime: acc.count ? Math.round(acc.total / acc.count) : 0
});
const mapValues = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));

/** 与 fastify-task queryStatistics 返回结构一致：按 granularity 分桶，只统计已结束任务 */
export const buildTaskStatisticsOverview = range => {
  const config = RANGE_CONFIG[range] || RANGE_CONFIG['7d'];
  const buckets = buildBuckets(config);
  const scale = BUCKET_DAYS[config.granularity];

  const byStatus = { success: 0, failed: 0, canceled: 0 };
  const byType = {};
  const byRunnerType = {};
  const recentTrend = [];
  const recentTrendByStatus = [];
  const recentTrendByType = [];
  const durationTrend = [];
  const hourlyMap = {};
  const summary = { all: createAcc(), byType: {}, byRunnerType: {}, byTypeByRunnerType: {} };

  buckets.forEach(({ key, start }) => {
    const bucketStatus = { success: 0, failed: 0, canceled: 0 };
    const bucketAll = createAcc();
    const bucketByType = {};
    const bucketByRunnerType = {};
    const bucketByTypeByRunnerType = {};

    TASK_TYPES.forEach(type => {
      RUNNER_TYPES.forEach(runnerType => {
        const success = random(2, 14) * scale;
        const failed = random(0, 3) * scale;
        const canceled = random(0, 1) * scale;
        const count = success + failed + canceled;
        const slice = { count, ...randomDuration() };

        bucketStatus.success += success;
        bucketStatus.failed += failed;
        bucketStatus.canceled += canceled;
        byType[type] = (byType[type] || 0) + count;
        byRunnerType[runnerType] = (byRunnerType[runnerType] || 0) + count;

        addAcc(bucketAll, slice);
        addAcc((bucketByType[type] = bucketByType[type] || createAcc()), slice);
        addAcc((bucketByRunnerType[runnerType] = bucketByRunnerType[runnerType] || createAcc()), slice);
        bucketByTypeByRunnerType[runnerType] = bucketByTypeByRunnerType[runnerType] || {};
        addAcc((bucketByTypeByRunnerType[runnerType][type] = bucketByTypeByRunnerType[runnerType][type] || createAcc()), slice);

        addAcc(summary.all, slice);
        addAcc((summary.byType[type] = summary.byType[type] || createAcc()), slice);
        addAcc((summary.byRunnerType[runnerType] = summary.byRunnerType[runnerType] || createAcc()), slice);
        summary.byTypeByRunnerType[runnerType] = summary.byTypeByRunnerType[runnerType] || {};
        addAcc((summary.byTypeByRunnerType[runnerType][type] = summary.byTypeByRunnerType[runnerType][type] || createAcc()), slice);

        [2, 8, 9, 10, 11, 14, 15, 16, 17, 20, 22].forEach(hour => {
          const day = new Date(start);
          day.setDate(day.getDate() + random(0, scale - 1));
          const date = formatDay(day);
          const hourKey = `${date}:${hour}:${type}:${runnerType}`;
          const ok = random(0, hour >= 9 && hour <= 17 ? 4 : 1);
          const bad = Math.random() < 0.15 ? 1 : 0;
          const item = (hourlyMap[hourKey] = hourlyMap[hourKey] || {
            date,
            hour,
            type,
            runnerType,
            totalCompleted: 0,
            successCount: 0,
            failedCount: 0,
            canceledCount: 0
          });
          item.totalCompleted += ok + bad;
          item.successCount += ok;
          item.failedCount += bad;
        });
      });
    });

    const total = bucketStatus.success + bucketStatus.failed + bucketStatus.canceled;
    Object.keys(byStatus).forEach(status => {
      byStatus[status] += bucketStatus[status];
      recentTrendByStatus.push({ date: key, status, count: bucketStatus[status] });
    });
    recentTrend.push({ date: key, count: total });
    Object.entries(bucketByType).forEach(([type, acc]) => recentTrendByType.push({ date: key, type, count: acc.count }));
    durationTrend.push({
      date: key,
      completedCount: total,
      successCount: bucketStatus.success,
      failedCount: bucketStatus.failed,
      canceledCount: bucketStatus.canceled,
      ...toAvg(bucketAll),
      byType: mapValues(bucketByType, toAvg),
      byRunnerType: mapValues(bucketByRunnerType, toAvg),
      byTypeByRunnerType: mapValues(bucketByTypeByRunnerType, types => mapValues(types, toAvg))
    });
  });

  const totalTasks = byStatus.success + byStatus.failed + byStatus.canceled;
  const { count, ...summaryAvg } = toAvg(summary.all);

  return {
    range,
    rangeLabel: config.label,
    granularity: config.granularity,
    startTime: buckets[0].start,
    endTime: buckets[buckets.length - 1].end,
    buckets,
    totalTasks,
    byStatus,
    byType,
    byRunnerType,
    recentTrend,
    recentTrendByStatus,
    recentTrendByType,
    durationTrend,
    duration: {
      completedCount: count,
      successCount: byStatus.success,
      failedCount: byStatus.failed,
      canceledCount: byStatus.canceled,
      ...summaryAvg,
      byType: mapValues(summary.byType, toAvg),
      byRunnerType: mapValues(summary.byRunnerType, toAvg),
      byTypeByRunnerType: mapValues(summary.byTypeByRunnerType, types => mapValues(types, toAvg))
    },
    hourlyCompletionTrend: Object.values(hourlyMap)
  };
};
