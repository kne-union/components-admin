import { Tag } from 'antd';
import normalizeSelectedList from './normalizeSelectedList';
import style from './style.module.scss';

const TenantUserSelectedFooter = ({ value, onChange, single, disabled, formatMessage }) => {
  const selectedList = normalizeSelectedList(value, single);

  const handleRemove = id => {
    if (disabled) {
      return;
    }
    if (single) {
      onChange(null);
      return;
    }
    onChange((Array.isArray(value) ? value : []).filter(item => String(item.id) !== String(id)));
  };

  return (
    <div className={style.footer}>
      <div className={style['footer-label']}>
        {single
          ? formatMessage({ id: 'TenantUserSelectSelectedLabelSingle' })
          : formatMessage({ id: 'TenantUserSelectSelectedLabel' }, { count: selectedList.length })}
      </div>
      <div className={style['footer-tags']}>
        {selectedList.length ? (
          selectedList.map(item => (
            <Tag
              key={item.id}
              className={style['footer-tag']}
              closable={!disabled}
              onClose={event => {
                event.preventDefault();
                handleRemove(item.id);
              }}>
              {item.name}
            </Tag>
          ))
        ) : (
          <span className={style['footer-empty']}>{formatMessage({ id: 'TenantUserSelectSelectedEmpty' })}</span>
        )}
      </div>
    </div>
  );
};

export default TenantUserSelectedFooter;
