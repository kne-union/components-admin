/** 浏览器 IANA 时区，传给 statistics 接口与 SSE，与后端「今日」划界一致 */
export const getClientIanaTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
};
