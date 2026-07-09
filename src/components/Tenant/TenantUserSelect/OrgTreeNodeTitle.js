import { Badge } from 'antd';
import style from './style.module.scss';

const OrgTreeNodeTitle = ({ name, selectedCount, single }) => {
  const hasSelected = selectedCount > 0;

  return (
    <span className={style['org-node-title']}>
      <span className={style['org-node-name']}>{name}</span>
      {hasSelected ? (
        single ? (
          <span className={style['org-node-dot']} />
        ) : (
          <Badge className={style['org-node-badge']} count={selectedCount} size="small" />
        )
      ) : null}
    </span>
  );
};

export default OrgTreeNodeTitle;
