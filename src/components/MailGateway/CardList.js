import { Checkbox, Empty, Radio, Tag } from 'antd';
import classnames from 'classnames';
import dayjs from 'dayjs';
import enums from './enums';
import style from './style.module.scss';

const ENUM_TAG_COLOR = { success: 'success', danger: 'error', progress: 'warning', info: 'processing', other: 'purple', default: 'default' };

export const EnumTag = ({ moduleName, value, locale }) => {
  const target = (enums[moduleName]?.({ locale }) || []).find(item => item.value === value);
  return <Tag color={ENUM_TAG_COLOR[target?.type] || 'default'}>{target?.description || value}</Tag>;
};

export const formatDateTime = value => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-');

const getOptionsColumn = columns =>
  Array.isArray(columns) ? columns.find(column => column?.name === 'options' || column?.renderType === 'options') : null;

const stopPropagation = event => event.stopPropagation();

const CardList = ({
  dataSource = [],
  columns,
  context,
  empty,
  renderToolbar,
  rowSelection,
  getSelectionProps,
  getRowKey,
  rowKey = 'id',
  layout = 'mobile',
  renderItem
}) => {
  const optionsColumn = getOptionsColumn(columns);
  return (
    <div className={style['card-list-wrap']}>
      {typeof renderToolbar === 'function' && renderToolbar()}
      {dataSource.length === 0 ? (
        <div className={style['card-list-empty']}>{empty || <Empty />}</div>
      ) : (
        <div className={classnames(style['card-list'], { [style['is-grid']]: layout === 'card' })}>
          {dataSource.map((item, index) => {
            const key = typeof getRowKey === 'function' ? getRowKey(item) : (item[rowKey] ?? index);
            const card = renderItem(item);
            const actions = card.actions || optionsColumn?.getValueOf?.(item, { context })?.children;
            const selection = rowSelection && typeof getSelectionProps === 'function' ? getSelectionProps(item) : null;
            const SelectionControl = rowSelection?.type === 'radio' ? Radio : Checkbox;
            return (
              <div
                key={key}
                className={classnames(style['card'], {
                  [style['is-selected']]: selection?.checked,
                  [style['is-muted']]: card.muted,
                  [style['is-clickable']]: !!card.onClick
                })}
                onClick={card.onClick}
              >
                <div className={style['card-head']}>
                  {selection && (
                    <span onClick={stopPropagation}>
                      <SelectionControl checked={selection.checked} disabled={selection.disabled} onChange={selection.onChange} />
                    </span>
                  )}
                  {card.leading}
                  <div className={style['card-title']}>{card.title}</div>
                  {card.extra && <div className={style['card-extra']}>{card.extra}</div>}
                </div>
                {card.subtitle && <div className={style['card-subtitle']}>{card.subtitle}</div>}
                {card.description && <div className={style['card-description']}>{card.description}</div>}
                {card.fields?.length > 0 && (
                  <div className={style['card-fields']}>
                    {card.fields
                      .filter(field => field && !field.hidden)
                      .map(field => (
                        <div key={field.label} className={style['card-field']}>
                          <span className={style['card-field-label']}>{field.label}</span>
                          <span className={style['card-field-value']}>{field.value ?? '-'}</span>
                        </div>
                      ))}
                  </div>
                )}
                {(card.footer || actions) && (
                  <div className={style['card-footer']} onClick={stopPropagation}>
                    <div className={style['card-footer-meta']}>{card.footer}</div>
                    {actions}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const createCardRenders = renderItem => ({
  renderMobile: props => <CardList {...props} renderItem={renderItem} />,
  renderCard: props => <CardList {...props} layout="card" renderItem={renderItem} />
});

export default CardList;
