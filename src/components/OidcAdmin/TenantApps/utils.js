import uniq from 'lodash/uniq';
import flattenPermissions from '@components/Tenant/TenantPermission/flattenPermissions';

// 开通写入 apps、apps:<code> 及该应用全部功能 code；关闭移除 apps:<code> 前缀下的全部 code
export const toggleAppCodes = ({ codes = [], appModule, enabled, prefix = 'apps' }) => {
  const appCode = `${prefix}:${appModule.code}`;
  if (enabled) {
    const appCodes = flattenPermissions({ modules: [appModule] }).map(({ code }) => `${prefix}:${code}`);
    return uniq([...codes, prefix, ...appCodes]);
  }
  const next = codes.filter(code => code !== appCode && code.indexOf(`${appCode}:`) !== 0);
  return next.some(code => code.indexOf(`${prefix}:`) === 0) ? next : next.filter(code => code !== prefix);
};
