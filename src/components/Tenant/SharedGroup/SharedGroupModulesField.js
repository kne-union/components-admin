import React, { useEffect, useMemo } from 'react';
import { Card, Checkbox, Radio, Tag } from 'antd';
import { useIntl } from '@kne/react-intl';
import { collectDataScopeModules } from './collectDataScopeModules';
import withLocale from '../withLocale';
import styles from './SharedGroupModulesField.module.scss';

/** 在 dataScope.list 允许的 access 中取值；非法或缺省时用 list 第一项（与权限配置顺序一致） */
const pickAccess = (raw, allowedAccess) => {
  if (!Array.isArray(allowedAccess) || !allowedAccess.length) {
    return 'read';
  }
  const acc = raw === 'write' || raw === 'read' ? raw : null;
  if (acc && allowedAccess.includes(acc)) {
    return acc;
  }
  return allowedAccess[0];
};

const accessLabels = {
  read: 'SharedGroupAccessRead',
  write: 'SharedGroupAccessWrite'
};

const dataScopeTypeLabels = {
  owner: 'DataScopeTypeOwner',
  org: 'DataScopeTypeOrg',
  orgSubtree: 'DataScopeTypeOrgSubtree',
  self: 'DataScopeTypeSelf'
};

/**
 * 共享组「共享模块」：仅展示 dataScope.open 的模块；每项只读/读写受 dataScope.list 约束。
 * layout=field 时供 SharedGroupModulesFormField 使用（标题由 FormInfo 字段 label/description 承担）。
 * 受控 value：[{ moduleCode, access: 'read' | 'write' }]。可直接点击「只读/读写」以选中该模块。
 */
const SharedGroupModulesField = withLocale(({ permissions, value = [], onChange, disabled, layout = 'card' }) => {
  const { formatMessage } = useIntl();
  const options = useMemo(() => collectDataScopeModules(permissions || { modules: [] }), [permissions]);

  const byCode = useMemo(() => {
    const m = new Map();
    const optBy = new Map(options.map(o => [o.moduleCode, o]));
    for (const v of Array.isArray(value) ? value : []) {
      if (!v || !v.moduleCode) {
        continue;
      }
      const opt = optBy.get(v.moduleCode);
      const allowed = opt?.allowedAccess || ['read', 'write'];
      m.set(v.moduleCode, pickAccess(v.access, allowed));
    }
    return m;
  }, [value, options]);

  useEffect(() => {
    if (!onChange || !options.length) {
      return;
    }
    const list = Array.isArray(value) ? value : [];
    const optBy = new Map(options.map(o => [o.moduleCode, o]));
    let changed = false;
    const out = list.map(v => {
      if (!v?.moduleCode) {
        return v;
      }
      const opt = optBy.get(v.moduleCode);
      if (!opt) {
        return v;
      }
      const next = pickAccess(v.access, opt.allowedAccess);
      if (next !== v.access) {
        changed = true;
      }
      return { moduleCode: v.moduleCode, access: next };
    });
    if (changed) {
      onChange(out);
    }
  }, [value, options, onChange]);

  const emit = nextMap => {
    const optBy = new Map(options.map(o => [o.moduleCode, o]));
    onChange(
      [...nextMap.entries()].map(([code, acc]) => ({
        moduleCode: code,
        access: pickAccess(acc, optBy.get(code)?.allowedAccess || ['read', 'write'])
      }))
    );
  };

  const setAccess = (moduleCode, access, allowedAccess) => {
    if (!allowedAccess.includes(access)) {
      return;
    }
    const next = new Map(byCode);
    next.set(moduleCode, access);
    emit(next);
  };

  const toggleModule = (item, checked) => {
    const next = new Map(byCode);
    if (checked) {
      next.set(item.moduleCode, pickAccess(undefined, item.allowedAccess));
    } else {
      next.delete(item.moduleCode);
    }
    emit(next);
  };

  const rowsWithSections = useMemo(() => {
    const rows = [];
    let lastSection = null;
    for (const item of options) {
      if (item.section !== lastSection) {
        rows.push({ type: 'section', key: `s-${item.section}`, label: item.section });
        lastSection = item.section;
      }
      rows.push({ type: 'item', key: item.moduleCode, item });
    }
    return rows;
  }, [options]);

  const body = (
    <>
      {layout === 'card' && (
        <div className={styles.hint}>{formatMessage({ id: 'SharedGroupModulesHint' })}</div>
      )}
      {options.length === 0 ? (
        <div className={styles.empty}>{formatMessage({ id: 'SharedGroupModulesEmpty' })}</div>
      ) : (
        <div className={styles.scroller}>
          {rowsWithSections.map(row => {
            if (row.type === 'section') {
              return (
                <div key={row.key} className={styles.section}>
                  {row.label}
                </div>
              );
            }
            const item = row.item;
            const checked = byCode.has(item.moduleCode);
            const current = checked ? byCode.get(item.moduleCode) : undefined;
            const indent = Math.max(0, item.depth - 1) * 16;
            return (
              <div key={row.key} className={styles.row} style={{ paddingLeft: 12 + indent }}>
                <div className={styles.rowMain}>
                  <Checkbox checked={checked} disabled={disabled} onChange={e => toggleModule(item, e.target.checked)}>
                    <span className={styles.moduleTitle}>
                      <strong>{item.name}</strong>
                      <Tag className={styles.scopeTag} color="processing">
                        {formatMessage({
                          id:
                            dataScopeTypeLabels[item.dataScopeType] ||
                            dataScopeTypeLabels.self
                        })}
                      </Tag>
                    </span>
                  </Checkbox>
                  <Radio.Group
                    className={styles.access}
                    size="small"
                    optionType="button"
                    buttonStyle="solid"
                    value={current}
                    disabled={disabled}
                    onChange={e => setAccess(item.moduleCode, e.target.value, item.allowedAccess)}>
                    {item.allowedAccess.map(acc => (
                      <Radio key={acc} value={acc}>
                        {formatMessage({ id: accessLabels[acc] || 'SharedGroupAccessRead' })}
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
                {item.namePath.length > 1 && (
                  <div className={styles.rowMeta}>
                    {item.breadcrumb ? `${item.breadcrumb} → ${item.name}` : item.namePath.join(' / ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  if (layout === 'field') {
    return <div className={styles.panel}>{body}</div>;
  }

  return (
    <Card size="small" className={styles.card} title={formatMessage({ id: 'SharedGroupModulesLabel' })}>
      {body}
    </Card>
  );
});

export default SharedGroupModulesField;
