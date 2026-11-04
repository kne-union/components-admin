export const DEFAULT_MAX_AGE = 86400;

export const toMfaFormData = data => ({
  enabled: !!data?.enabled,
  maxAgeMinutes: Math.round(Number(data?.maxAge ?? DEFAULT_MAX_AGE) / 60)
});

export const toMfaPayload = formData => ({
  enabled: !!formData.enabled,
  methods: ['sms'],
  maxAge: Math.max(0, Math.round(Number(formData.maxAgeMinutes) || 0) * 60)
});

/** 秒数拆成天 / 小时 / 分钟 / 秒，只保留非 0 部分 */
export const splitDuration = seconds => {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  return [
    ['Days', Math.floor(value / 86400)],
    ['Hours', Math.floor((value % 86400) / 3600)],
    ['Minutes', Math.floor((value % 3600) / 60)],
    ['Seconds', value % 60]
  ].filter(([, count]) => count > 0);
};
