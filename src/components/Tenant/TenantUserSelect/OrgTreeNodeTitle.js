import style from './style.module.scss';

const highlight = (name, keyword) => {
  const text = String(name || '');
  const index = keyword ? text.toLowerCase().indexOf(keyword) : -1;
  if (index < 0) {
    return text;
  }
  return (
    <>
      {text.slice(0, index)}
      <mark className={style['org-node-mark']}>{text.slice(index, index + keyword.length)}</mark>
      {text.slice(index + keyword.length)}
    </>
  );
};

const OrgTreeNodeTitle = ({ name, keyword, selectedCount, userCount }) => {
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
      <span className={style['org-node-name']}>{highlight(name, keyword)}</span>
      {badge}
    </span>
  );
};

export default OrgTreeNodeTitle;
