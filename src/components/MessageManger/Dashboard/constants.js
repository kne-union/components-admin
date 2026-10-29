import { createThemeColors, defaultColors } from '@kne/react-box';
import { CHART_NEUTRAL } from '../../../utils/dashboard/chart';

export * from '../../../utils/dashboard/chart';

/** 看板语义色取自 @kne/react-box 的 defaultColors；颜色只用来区分渠道 / 模板状态，其余界面保持中性灰阶 */
export const PALETTE = {
  total: defaultColors.Blue,
  email: defaultColors.Purple,
  sms: defaultColors.Green,
  enabled: defaultColors.Green,
  disabled: createThemeColors(defaultColors.Gray).glow,
  ...CHART_NEUTRAL
};

/** 消息类型：0 邮件、1 短信（与 enums messageManagerType 一致） */
export const CHANNELS = [
  { key: 'email', type: '0', labelId: 'EmailChannel', color: PALETTE.email },
  { key: 'sms', type: '1', labelId: 'SMS', color: PALETTE.sms }
];

const CODE_COLOR_KEYS = ['Purple', 'Green', 'Orange', 'Blue', 'Pink', 'Yellow', 'Red', 'Gray'];

export const CODE_COLOR_MAP = CODE_COLOR_KEYS.map(key => defaultColors[key]);
