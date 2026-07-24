import merge from 'lodash/merge';

const entryKey = entry => `${entry?.namespace || ''}::${entry?.code || ''}`;

const hasSourceText = entry => !!(entry?.sourceTarget != null && String(entry.sourceTarget).trim());

/**
 * 从当前页树形数据中回填默认语言文案（同 namespace+code）。
 */
export const fillSourceTargetFromRows = (entries = [], allRows = []) => {
  const sourceMap = new Map();
  (allRows || []).forEach(row => {
    if (!row?.locale) {
      return;
    }
    const key = entryKey(row);
    if (hasSourceText(row)) {
      sourceMap.set(key, String(row.sourceTarget));
    }
    if (row.defaultLocale && row.locale === row.defaultLocale && row.target != null && String(row.target).trim()) {
      sourceMap.set(key, String(row.target));
    }
  });

  return (entries || []).map(entry => {
    if (!entry || hasSourceText(entry)) {
      return entry;
    }
    const sourceTarget = sourceMap.get(entryKey(entry)) || '';
    return sourceTarget ? Object.assign({}, entry, { sourceTarget }) : entry;
  });
};

/**
 * 对仍缺 sourceTarget 的词条，按 namespace+code 再查一次列表补齐默认语言文案。
 * listApi 请传原始 list 配置（不要带 tree transform）。
 */
export const enrichReviewEntries = async ({ ajax, listApi, entries = [], allRows = [] } = {}) => {
  let next = fillSourceTargetFromRows(entries, allRows);
  const missing = next.filter(entry => entry?.locale && !hasSourceText(entry));
  if (missing.length === 0 || !ajax || !listApi) {
    return next;
  }

  const keyMap = new Map();
  missing.forEach(entry => {
    const key = entryKey(entry);
    if (!keyMap.has(key)) {
      keyMap.set(key, { namespace: entry.namespace, code: entry.code });
    }
  });

  const fetched = new Map();
  await Promise.all(
    Array.from(keyMap.values()).map(async ({ namespace, code }) => {
      try {
        const { data: resData } = await ajax(
          merge({}, listApi, {
            params: {
              namespace,
              code,
              perPage: 50,
              currentPage: 1
            }
          })
        );
        if (resData?.code !== 0) {
          return;
        }
        const pageData = resData?.data?.pageData || [];
        // 兼容未 transform / 已 transform 两种结构
        const rows = pageData.filter(item => item?.locale);
        let sourceTarget = '';
        let defaultLocale = '';
        rows.forEach(row => {
          if (row.defaultLocale) {
            defaultLocale = row.defaultLocale;
          }
          if (hasSourceText(row)) {
            sourceTarget = String(row.sourceTarget);
          }
        });
        if (!sourceTarget && defaultLocale) {
          const def = rows.find(row => row.locale === defaultLocale);
          if (def?.target != null) {
            sourceTarget = String(def.target);
          }
        }
        if (!sourceTarget) {
          const approved = rows.find(row => row.reviewStatus === 'approved' && row.target);
          if (approved) {
            sourceTarget = String(approved.target);
          }
        }
        if (sourceTarget) {
          fetched.set(`${namespace}::${code}`, { sourceTarget, defaultLocale });
        }
      } catch (e) {
        // ignore
      }
    })
  );

  if (fetched.size === 0) {
    return next;
  }

  return next.map(entry => {
    const hit = fetched.get(entryKey(entry));
    if (!hit || hasSourceText(entry)) {
      return entry;
    }
    return Object.assign({}, entry, {
      sourceTarget: hit.sourceTarget,
      defaultLocale: entry.defaultLocale || hit.defaultLocale
    });
  });
};
