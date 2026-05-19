import style from './UserOrgTags.module.scss';

export const tooltipOverlayProps = {
  overlayClassName: style.tooltipOverlay,
  mouseEnterDelay: 0.2
};

/** 单部门：名称 + 完整路径（有差异时分行展示） */
export const OrgPathTooltip = ({ org }) => {
  const path = org.fullPath || org.label;
  if (!path) {
    return null;
  }
  if (!org.label || path === org.label) {
    return <div className={style.tooltipSingle}>{path}</div>;
  }
  return (
    <div className={style.tooltipSingle}>
      <div className={style.tooltipPrimary}>{org.label}</div>
      <div className={style.tooltipSecondary}>{path}</div>
    </div>
  );
};

/** 多部门列表（+N 悬停） */
export const OrgListTooltip = ({ orgs, title }) => (
  <div className={style.tooltipPanel}>
    <div className={style.tooltipHeader}>{title}</div>
    <ul className={style.tooltipList}>
      {orgs.map(org => {
        const path = org.fullPath || org.label;
        const showPath = path && org.label && path !== org.label;
        return (
          <li key={org.id} className={style.tooltipListItem}>
            <span className={style.tooltipItemLabel}>{org.label || path}</span>
            {showPath ? <span className={style.tooltipItemPath}>{path}</span> : null}
          </li>
        );
      })}
    </ul>
  </div>
);
