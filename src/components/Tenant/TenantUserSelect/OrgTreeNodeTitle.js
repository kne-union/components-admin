import style from './style.module.scss';

const OrgTreeNodeTitle = ({ name, selectedCount, userCount }) => {
  const orgTotal = Number(userCount) || 0;
  const selected = Number(selectedCount) || 0;

  let badge = null;
  if (selected > 0) {
    // 人数未知时不要展示「已选/0」
    badge =
      orgTotal > 0 ? (
        <span className={style['org-node-badge']}>{`${selected}/${orgTotal}`}</span>
      ) : (
        <span className={style['org-node-badge']}>{selected}</span>
      );
  } else if (orgTotal > 0) {
    // 无选中成员且人数不为 0：灰色气泡显示组织人数
    badge = <span className={style['org-node-count']}>{orgTotal}</span>;
  }

  return (
    <span className={style['org-node-title']}>
      <span className={style['org-node-name']}>{name}</span>
      {badge}
    </span>
  );
};

export default OrgTreeNodeTitle;
