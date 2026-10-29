import { defaultColors } from '@kne/react-box';

/** 看板图表的中性灰阶；语义色由各业务看板按 @kne/react-box defaultColors 自行定义 */
export const CHART_NEUTRAL = {
  ink: '#1c2024',
  muted: '#80838d',
  line: '#e8e8ec',
  grid: '#f0f0f3'
};

export const RANGE_OPTIONS = ['7d', '1m', '3m', '1y'];

export const TIME_PERIODS = [
  { id: 'Dawn', start: 0, end: 6 },
  { id: 'Morning', start: 6, end: 12 },
  { id: 'Afternoon', start: 12, end: 18 },
  { id: 'Evening', start: 18, end: 24 }
];

/** 指标需要关注时返回状态色（低于 / 高于阈值为 Red，次一级为 Yellow），正常返回 undefined */
export const pickMetricState = (ratio, { warn, danger, higherIsWorse = false }) => {
  if (ratio == null || !Number.isFinite(ratio)) return undefined;
  const worse = (value, limit) => (higherIsWorse ? value > limit : value < limit);
  if (worse(ratio, danger)) return defaultColors.Red;
  if (worse(ratio, warn)) return defaultColors.Yellow;
  return undefined;
};

export const tooltipStyle = {
  trigger: 'axis',
  axisPointer: {
    type: 'shadow',
    shadowStyle: { color: 'rgba(28, 32, 36, 0.04)' },
    label: { show: false }
  },
  backgroundColor: '#fff',
  borderColor: CHART_NEUTRAL.line,
  borderWidth: 1,
  padding: [8, 12],
  textStyle: { color: CHART_NEUTRAL.ink, fontSize: 12 },
  extraCssText: 'border-radius:8px;box-shadow:0 8px 24px rgba(28,32,36,0.08);',
  confine: true
};

export const lineTooltipStyle = {
  ...tooltipStyle,
  axisPointer: { type: 'line', lineStyle: { color: '#c1c3c9', width: 1 }, label: { show: false } }
};

export const legendCenterStyle = {
  top: 0,
  left: 0,
  icon: 'circle',
  itemWidth: 8,
  itemHeight: 8,
  itemGap: 16,
  textStyle: { color: CHART_NEUTRAL.muted, fontSize: 12 }
};

const BAR_TOP_RADIUS = [4, 4, 0, 0];

/** 堆叠柱状图：每根柱子只给最上面一段有值的系列加顶部圆角，非柱状 series 原样返回 */
export const roundStackedBarTops = series => {
  const bars = series.filter(item => item.type === 'bar');
  const length = Math.max(0, ...bars.map(item => item.data.length));
  const topIndexes = Array.from({ length }, (_, i) => {
    for (let k = bars.length - 1; k >= 0; k--) {
      if ((Number(bars[k].data[i]) || 0) > 0) return k;
    }
    return -1;
  });
  return series.map(item => {
    const k = bars.indexOf(item);
    if (k < 0) return item;
    return {
      ...item,
      data: item.data.map((value, i) => (topIndexes[i] === k ? { value, itemStyle: { borderRadius: BAR_TOP_RADIUS } } : value))
    };
  });
};

export const lineChartGrid = { left: 4, right: 20, bottom: 4, top: 36, containLabel: true };
export const lineChartGridWithRotatedLabels = { ...lineChartGrid, bottom: 20, left: 14, right: 14 };
export const lineSmooth = 0.3;
export const axisLineStyle = { lineStyle: { color: CHART_NEUTRAL.line } };
export const axisLabelStyle = { color: CHART_NEUTRAL.muted, fontSize: 11 };
export const splitLineStyle = { lineStyle: { color: CHART_NEUTRAL.grid, width: 1 } };
