export const RANGE_OPTIONS = ['7d', '1m', '1y'];

export const buildUrlWithParams = (url, params = {}) => {
  const query = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  if (!query) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
};

export const PALETTE = {
  total: '#3b82f6',
  success: '#10b981',
  failed: '#ef4444',
  running: '#f59e0b',
  pending: '#6366f1',
  canceled: '#94a3b8',
  waiting: '#06b6d4',
  manual: '#8b5cf6',
  system: '#3b82f6',
  pie: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#94a3b8', '#ec4899'],
  period: { dawn: '#818cf8', morning: '#f59e0b', afternoon: '#f97316', evening: '#6366f1' }
};

export const TIME_PERIODS = [
  { id: 'Dawn', start: 0, end: 6, color: PALETTE.period.dawn },
  { id: 'Morning', start: 6, end: 12, color: PALETTE.period.morning },
  { id: 'Afternoon', start: 12, end: 18, color: PALETTE.period.afternoon },
  { id: 'Evening', start: 18, end: 24, color: PALETTE.period.evening }
];

export const TASK_STATUS_LIST = ['pending', 'running', 'waiting', 'success', 'failed', 'canceled'];

export const STATUS_COLOR_MAP = {
  pending: PALETTE.pending,
  running: PALETTE.running,
  waiting: PALETTE.waiting,
  success: PALETTE.success,
  failed: PALETTE.failed,
  canceled: PALETTE.canceled
};

export const TASK_TYPE_COLOR_MAP = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6'];

export const tooltipStyle = {
  trigger: 'axis',
  axisPointer: {
    type: 'line',
    lineStyle: { color: 'rgba(100, 116, 139, 0.45)', width: 1 },
    label: { show: false }
  },
  backgroundColor: 'rgba(255,255,255,0.96)',
  borderColor: '#e2e8f0',
  borderWidth: 1,
  textStyle: { color: '#334155', fontSize: 12 },
  confine: true
};

export const itemTooltipStyle = {
  trigger: 'item',
  formatter: '{b}: {c} ({d}%)',
  backgroundColor: 'rgba(255,255,255,0.96)',
  borderColor: '#e2e8f0',
  borderWidth: 1,
  textStyle: { color: '#334155', fontSize: 12 },
  confine: true,
  position(point, params, dom, rect, size) {
    const x = point[0];
    const y = point[1];
    const cw = size?.contentSize?.[0] ?? 140;
    const ch = size?.contentSize?.[1] ?? 48;
    const vw = size?.viewSize?.[0] ?? 400;
    const vh = size?.viewSize?.[1] ?? 300;
    let left = x + 12;
    let top = y - ch - 12;
    if (top < 8) top = y + 12;
    if (left + cw > vw - 8) left = Math.max(8, vw - cw - 8);
    if (top + ch > vh - 8) top = Math.max(8, vh - ch - 8);
    return [left, top];
  },
  extraCssText: 'border-radius:8px;box-shadow:0 4px 14px rgba(15,23,42,0.12);'
};

export const pieSeries = (center = ['50%', '46%'], radius = ['46%', '64%']) => ({
  type: 'pie',
  radius,
  center,
  clockwise: true,
  padAngle: 1.25,
  avoidLabelOverlap: true,
  itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
  label: { show: false },
  labelLine: { show: false },
  emphasis: {
    scale: false,
    itemStyle: { shadowBlur: 14, shadowColor: 'rgba(15,23,42,0.14)', borderWidth: 3, borderColor: '#fff' },
    label: { show: false }
  }
});

export const legendPieStyle = {
  type: 'scroll',
  orient: 'horizontal',
  left: 'center',
  bottom: 4,
  width: '88%',
  height: 44,
  pageButtonItemGap: 8,
  pageIconSize: 11,
  pageTextStyle: { color: '#94a3b8' },
  icon: 'roundRect',
  itemWidth: 10,
  itemHeight: 10,
  itemGap: 14,
  textStyle: { color: '#64748b', fontSize: 11 }
};

export const legendCenterStyle = {
  top: 4,
  left: 'center',
  itemGap: 18,
  padding: [0, 0, 6, 0],
  textStyle: { color: '#64748b', fontSize: 12 }
};

export const lineChartGrid = { left: 12, right: 16, bottom: 12, top: 52, containLabel: true };
export const lineChartGridWithRotatedLabels = { ...lineChartGrid, bottom: 20, left: 14, right: 14 };
export const lineSmooth = 0.38;
export const axisLineStyle = { lineStyle: { color: '#e2e8f0' } };
export const axisLabelStyle = { color: '#94a3b8' };
export const splitLineStyle = { lineStyle: { color: '#f1f5f9', type: 'dashed', width: 1 } };

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
