import { normalizeDataScopeList } from './normalizeDataScopeList';

/**
 * 从权限树中收集已开启数据权限（dataScope.open）的模块，供共享组「共享模块」勾选。
 * 与后端 fastify-tenant 中 permissions 模块节点上的 dataScope 约定一致。
 *
 * @param {{ modules?: Array<Record<string, unknown>> }} permissions
 * @returns {Array<{ moduleCode: string, name: string, namePath: string[], allowedAccess: string[], dataScopeType: 'owner' | 'org' | 'orgSubtree' | 'self', depth: number, section: string, breadcrumb: string }>}
 */
export function collectDataScopeModules(permissions) {
  const out = [];
  const root = permissions && Array.isArray(permissions.modules) ? permissions.modules : [];

  const walk = (modules, parentCode, namePath) => {
    for (const mod of modules) {
      if (!mod || typeof mod.code !== 'string') {
        continue;
      }
      const currentCode = parentCode ? `${parentCode}:${mod.code}` : mod.code;
      const path = [...namePath, mod.name || mod.code];
      const ds = mod.dataScope;
      if (ds && ds.open === true) {
        const allowedAccess = normalizeDataScopeList(ds.list);
        if (allowedAccess.length) {
          const depth = Math.max(0, path.length - 1);
          const section = path[0] || mod.name || mod.code;
          const breadcrumb = path.length > 1 ? path.slice(0, -1).join(' / ') : '';
          const dataScopeType =
            ds.type === 'owner' || ds.type === 'org' || ds.type === 'orgSubtree' || ds.type === 'self'
              ? ds.type
              : 'self';
          out.push({
            moduleCode: currentCode,
            name: mod.name || mod.code,
            namePath: path,
            allowedAccess,
            dataScopeType,
            depth,
            section,
            breadcrumb
          });
        }
      }
      if (Array.isArray(mod.modules) && mod.modules.length) {
        walk(mod.modules, currentCode, path);
      }
    }
  };

  walk(root, '', []);
  out.sort((a, b) => a.moduleCode.localeCompare(b.moduleCode));
  return out;
}
