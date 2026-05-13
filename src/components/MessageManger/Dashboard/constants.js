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
  email: '#6366f1',
  sms: '#06b6d4',
  total: '#3b82f6',
  enabled: '#10b981',
  disabled: '#f43f5e',
  pie: ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6'],
  period: { dawn: '#818cf8', morning: '#f59e0b', afternoon: '#f97316', evening: '#6366f1' }
};

export const TIME_PERIODS = [
  { id: 'Dawn', start: 0, end: 6, color: PALETTE.period.dawn },
  { id: 'Morning', start: 6, end: 12, color: PALETTE.period.morning },
  { id: 'Afternoon', start: 12, end: 18, color: PALETTE.period.afternoon },
  { id: 'Evening', start: 18, end: 24, color: PALETTE.period.evening }
];

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
  appendToBody: true,
  /** 优先出现在指针左上，减少压住饼图与图例 */
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

/** 饼图专用：关闭扇区放大，避免 hover 盖住图例；扇区间细缝更易读 */
export const pieSeries = (center = ['50%', '46%'], radius = ['46%', '64%']) => ({
  type: 'pie',
  radius,
  center,
  clockwise: true,
  padAngle: 1.25,
  avoidLabelOverlap: true,
  itemStyle: {
    borderRadius: 5,
    borderColor: '#fff',
    borderWidth: 2
  },
  label: { show: false },
  labelLine: { show: false },
  emphasis: {
    scale: false,
    itemStyle: {
      shadowBlur: 14,
      shadowColor: 'rgba(15,23,42,0.14)',
      borderWidth: 3,
      borderColor: '#fff'
    },
    label: { show: false }
  }
});

/** 消息类型分布：底部横向图例，不占右侧 */
export const legendPieTypeStyle = {
  orient: 'horizontal',
  left: 'center',
  bottom: 8,
  icon: 'circle',
  itemWidth: 10,
  itemHeight: 10,
  itemGap: 28,
  textStyle: { color: '#64748b', fontSize: 12 }
};

/** 模板编码：图例放底部横向滚动，饼图居中偏上，避免与右侧长列表挤在一起 */
export const legendPieCodeStyle = {
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

export const gridStyle = { left: '3%', right: '4%', bottom: '3%', top: 36, containLabel: true };

/** 折线图：边距与顶部留白，图例与坐标轴不挤占绘图区 */
export const lineChartGrid = { left: 12, right: 16, bottom: 12, top: 52, containLabel: true };

/** 日期点较多时加大底部，配合斜向刻度 */
export const lineChartGridWithRotatedLabels = {
  ...lineChartGrid,
  bottom: 20,
  left: 14,
  right: 14
};

export const lineSmooth = 0.38;

export const axisLineStyle = { lineStyle: { color: '#e2e8f0' } };
export const axisLabelStyle = { color: '#94a3b8' };
export const splitLineStyle = { lineStyle: { color: '#f1f5f9', type: 'dashed', width: 1 } };
