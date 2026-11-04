import { defaultColors } from '@kne/react-box';
import { CHART_NEUTRAL } from '../../../utils/dashboard/chart';

export * from '../../../utils/dashboard/chart';

/** 看板语义色取自 @kne/react-box 的 defaultColors；颜色只用来区分 topic / 指标状态，其余界面保持中性灰阶 */
export const PALETTE = {
  total: defaultColors.Blue,
  consumed: defaultColors.Green,
  failed: defaultColors.Red,
  dlq: defaultColors.Orange,
  ...CHART_NEUTRAL
};

const TOPIC_COLOR_KEYS = ['Blue', 'Purple', 'Green', 'Orange', 'Pink', 'Yellow', 'Red', 'Gray'];

export const TOPIC_COLORS = TOPIC_COLOR_KEYS.map(key => defaultColors[key]);

export const TREND_METRICS = [
  { key: 'queueDepth', labelId: 'QueueDepth', unit: '' },
  { key: 'consumeRate', labelId: 'ConsumeRate', unit: '/s' },
  { key: 'failureRate', labelId: 'FailureRate', unit: '/s' },
  { key: 'dlqRate', labelId: 'DLQRate', unit: '/s' }
];
