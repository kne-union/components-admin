export const CONTENT = {
  'zh-CN': {
    title: '构建面向未来的人才能力',
    subtitle: ['紧跟岗位发展变化，预判未来能力要求，摸清人才储备短板，', '让每一次人才决策都有据可依、落地可行。'],
    cardTitles: ['关键技能', '岗位胜任度', '人力规划', '技能差距', '人才流动', '职业发展路径'],
    quote: '盘清当下人才底数，找准未来能力建设的核心方向。'
  },
  'en-US': {
    title: "Prepare your workforce for what's next.",
    subtitle: 'Connect roles, people, and skills to anticipate future needs, close critical gaps, and take action with confidence.',
    cardTitles: ['Critical Skills', 'Role Readiness', 'Workforce Planning', 'Skill Gaps', 'Talent Mobility', 'Career Pathways'],
    quote: 'Turn workforce insights into better decisions.'
  }
};

export const CARD_LAYOUT = [
  { variant: 'peach-gradient', position: 'top-left', lines: 1 },
  { variant: 'glass', position: 'top-right', lines: 2 },
  { variant: 'purple', position: 'mid-left', lines: 2 },
  { variant: 'glass-mid', position: 'mid-center', lines: 2 },
  { variant: 'cyan', position: 'bottom-left', lines: 2 },
  { variant: 'lime', position: 'bottom-right', lines: 2 }
];

export const resolveContentKey = locale => {
  if (typeof locale === 'string' && locale.toLowerCase().startsWith('en')) {
    return 'en-US';
  }
  return 'zh-CN';
};
