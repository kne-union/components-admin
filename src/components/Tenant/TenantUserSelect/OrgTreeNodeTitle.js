import style from './style.module.scss';

const OrgTreeNodeTitle = ({ name, selectedCount, userCount, active }) => {
  const orgTotal = Number(userCount) || 0;
  const selected = Number(selectedCount) || 0;

  let badge = null;
  if (active && selected > 0) {
    // 当前选中组织且已有选中的人：蓝色气泡「已选人数/组织人数」
    badge = <span className={style['org-node-badge']}>{`${selected}/${orgTotal}`}</span>;
  } else if (orgTotal > 0) {
    // 其它情况且人数不为 0：灰色气泡显示组织人数
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
