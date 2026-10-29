import { createThemeColors, defaultColors } from '@kne/react-box';
import { CHART_NEUTRAL } from '../../../utils/dashboard/chart';

export * from '../../../utils/dashboard/chart';

export const buildUrlWithParams = (url, params = {}) => {
  const query = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  if (!query) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
};

/** 看板语义色取自 @kne/react-box 的 defaultColors；颜色只用来表达状态 / 执行方式，其余界面保持中性灰阶 */
export const PALETTE = {
  total: defaultColors.Blue,
  success: defaultColors.Green,
  failed: defaultColors.Red,
  running: defaultColors.Orange,
  pending: defaultColors.Purple,
  canceled: createThemeColors(defaultColors.Gray).glow,
  waiting: defaultColors.Blue,
  manual: defaultColors.Purple,
  system: defaultColors.Blue,
  rate: defaultColors.Purple,
  ...CHART_NEUTRAL
};

export const TASK_STATUS_LIST = ['pending', 'running', 'waiting', 'success', 'failed', 'canceled'];

export const STATUS_COLOR_MAP = {
  pending: PALETTE.pending,
  running: PALETTE.running,
  waiting: PALETTE.waiting,
  success: PALETTE.success,
  failed: PALETTE.failed,
  canceled: PALETTE.canceled
};

/** 任务类型色：按 key 打散 defaultColors，减轻相邻系列色相过近；不含 Black */
const TASK_TYPE_COLOR_KEYS = ['Purple', 'Green', 'Orange', 'Blue', 'Pink', 'Yellow', 'Red', 'Gray'];

export const TASK_TYPE_COLOR_MAP = TASK_TYPE_COLOR_KEYS.map(key => defaultColors[key]);

/** 任务类型 key 稳定排序：图表 series 与列表共用，保证同一 type 色标一致 */
export const sortTaskTypeKeys = types => {
  const arr = types == null ? [] : [...types];
  return arr.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }));
};

/** 接口约定为毫秒；超出此上限视为异常数据（如错误聚合），不参与展示与加权回算 */
export const MAX_STATISTICS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** 看板「多任务耗时合计」等展示用：允许大于单任务校验上限，仍防极端异常值 */
export const DASHBOARD_AGGREGATE_DURATION_CAP_MS = 5 * 365 * 24 * 60 * 60 * 1000;

export const sanitizeStatisticsDurationMs = value => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n > MAX_STATISTICS_DURATION_MS) return null;
  return n;
};

/** 单任务仍走 sanitize；超长队列等待或合计耗时在 cap 内用于展示 */
export const resolveDurationMsForDashboard = raw => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  const sane = sanitizeStatisticsDurationMs(n);
  if (sane != null) return sane;
  return Math.min(n, DASHBOARD_AGGREGATE_DURATION_CAP_MS);
};

/**
 * 优先使用容器顶层字段（经 sanitize）；无效时按 count 对 byType、byRunnerType 做加权回算（毫秒）。
 */
export const pickStatisticsDurationMs = (container, field, breakdownKeys = ['byType', 'byRunnerType']) => {
  const direct = sanitizeStatisticsDurationMs(container?.[field]);
  if (direct != null) return direct;
  for (const key of breakdownKeys) {
    const obj = container?.[key];
    if (!obj || typeof obj !== 'object') continue;
    let sum = 0;
    let w = 0;
    for (const v of Object.values(obj)) {
      if (!v || typeof v !== 'object') continue;
      const c = Number(v.count) || 0;
      if (c <= 0) continue;
      const x = sanitizeStatisticsDurationMs(v[field]);
      if (x == null) continue;
      sum += x * c;
      w += c;
    }
    if (w > 0) return sum / w;
  }
  return null;
};

export const formatDuration = ms => {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return '-';
  if (ms === 0) return '0ms';

  const units = [
    { label: 'ms', value: 1 },
    { label: 's', value: 1000 },
    { label: 'min', value: 60 * 1000 },
    { label: 'h', value: 60 * 60 * 1000 },
    { label: 'd', value: 24 * 60 * 60 * 1000 },
    { label: 'mon', value: 30 * 24 * 60 * 60 * 1000 },
    { label: 'y', value: 365 * 24 * 60 * 60 * 1000 }
  ];

  let unit = units[0];
  for (let i = 0; i < units.length; i++) {
    const next = units[i + 1];
    unit = units[i];
    if (!next || ms < next.value) break;
  }

  const raw = ms / unit.value;
  const rounded = Math.round(raw * 10) / 10;
  const text = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
  return `${text}${unit.label}`;
};
