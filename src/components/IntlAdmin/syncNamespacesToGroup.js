import merge from 'lodash/merge';
import { flattenGroupTree, resolveGroupTreeData } from '../GroupSelect/groupHelpers';
import { notifyGroupTreeChange } from '../GroupSelect/groupTreeChangeBus';
import { INTL_NAMESPACE_TYPE } from './constants';

const GLOBAL_CODE = 'global';

/** 从 GroupSelect 表单值取出 namespace code 字符串 */
export const resolveNamespaceCode = value => {
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'object') {
    return String(value.code ?? value.value ?? '').trim();
  }
  return String(value).trim();
};

/** 表单回显用 { code, name } */
export const toNamespaceFieldValue = value => {
  const code = resolveNamespaceCode(value);
  if (!code) {
    return value;
  }
  if (value && typeof value === 'object' && (value.name != null || value.code != null)) {
    return {
      code,
      name: value.name ?? value.label ?? code
    };
  }
  return { code, name: code };
};

const sortGlobalFirst = list => {
  const next = (list || []).slice();
  next.sort((a, b) => {
    const aCode = a?.code || a;
    const bCode = b?.code || b;
    if (aCode === GLOBAL_CODE && bCode !== GLOBAL_CODE) {
      return -1;
    }
    if (bCode === GLOBAL_CODE && aCode !== GLOBAL_CODE) {
      return 1;
    }
    return 0;
  });
  return next;
};

/**
 * 将 langLib.namespaces 中缺失的命名空间幂等写入 group（type=intl-namespace）。
 * global 优先创建；创建后通知 GroupFolder 刷新。
 */
export const syncNamespacesToGroup = async ({ ajax, apis, language = 'zh-CN', type = INTL_NAMESPACE_TYPE } = {}) => {
  const namespacesApi = apis?.intlAdmin?.langLib?.namespaces;
  const groupApis = apis?.group || {};
  const groupListApi = groupApis.groupList;
  const createApi = groupApis.create || groupApis.save;
  if (!ajax || !namespacesApi || !groupListApi || !createApi) {
    return { created: [] };
  }

  try {
    const [{ data: nsRes }, { data: groupRes }] = await Promise.all([
      ajax(merge({}, namespacesApi)),
      ajax(
        merge({}, groupListApi, {
          params: Object.assign({}, groupListApi.params, { type, language, output: 'tree' })
        })
      )
    ]);

    if (nsRes?.code !== 0) {
      return { created: [] };
    }

    const namespaces = sortGlobalFirst(
      (nsRes?.data?.pageData || []).map(item => item.namespace || item).filter(Boolean)
    );
    if (namespaces.length === 0) {
      return { created: [] };
    }

    const tree = resolveGroupTreeData(groupRes?.code === 0 ? groupRes.data : groupRes);
    const existing = new Set(
      flattenGroupTree(tree)
        .map(item => item?.code)
        .filter(Boolean)
    );

    const created = [];
    for (const code of namespaces) {
      if (existing.has(code)) {
        continue;
      }
      const { data: createRes } = await ajax(
        merge({}, createApi, {
          data: {
            type,
            language,
            code,
            name: code
          }
        })
      );
      if (createRes?.code === 0) {
        existing.add(code);
        created.push(code);
      }
    }

    if (created.length > 0) {
      notifyGroupTreeChange(type, language, 'add', { codes: created });
    }

    return { created };
  } catch (e) {
    return { created: [] };
  }
};

/** GroupFolder groupList 结果将 global 置顶 */
export const sortGroupListGlobalFirst = data => {
  const list = resolveGroupTreeData(data);
  return sortGlobalFirst(list);
};
