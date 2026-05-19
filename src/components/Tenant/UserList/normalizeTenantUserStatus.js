/**
 * 租户用户 status 为 open / closed；兼容 active / inactive 别名。
 *
 * @param {unknown} status
 * @returns {'open' | 'closed' | undefined}
 */
export function normalizeTenantUserStatus(status) {
  if (status == null || status === '') {
    return undefined;
  }
  const s = String(status).trim();
  if (s === 'active') {
    return 'open';
  }
  if (s === 'inactive') {
    return 'closed';
  }
  if (s === 'open' || s === 'closed') {
    return s;
  }
  return undefined;
}
