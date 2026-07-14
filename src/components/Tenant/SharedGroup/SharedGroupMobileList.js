import { Empty, Flex } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import style from './SharedGroupMobileList.module.scss';

const resolveRowId = (item, rowKey = 'id') => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);

const resolveOptionsColumn = columns => {
  if (!Array.isArray(columns)) {
    return null;
  }
  return columns.find(column => column?.name === 'options' || column?.renderType === 'options') || null;
};

const countOf = value => (Array.isArray(value) ? value.length : 0);

/**
 * 共享组列表移动端卡片：名称为主信息，成员/数据来源/模块数量为次要信息，描述为辅助信息
 */
const SharedGroupMobileList = ({ dataSource = [], columns, rowKey = 'id', context, empty, formatMessage }) => {
  if (!dataSource.length) {
    return <div className={style.empty}>{empty || <Empty />}</div>;
  }

  const optionsColumn = resolveOptionsColumn(columns);

  return (
    <div className={classnames(style.list, 'info-page-table-mobile-card-list')}>
      <Flex vertical gap={12}>
        {dataSource.map(item => {
          const id = resolveRowId(item, rowKey);
          const actions = optionsColumn?.getValueOf?.(item, { context })?.children;
          const description = item?.description;
          const memberCount = countOf(item?.members);
          const dataSourceCount = countOf(item?.dataSources);
          const moduleCount = countOf(item?.sharedModules);

          return (
            <div key={id} className={classnames(style.card, 'info-page-table-mobile-card')}>
              <div className={style.body}>
                <div className={style.title}>{item?.name || '-'}</div>

                <Flex align="center" gap={8} wrap="wrap" className={style.meta}>
                  <span className={style.metaItem}>
                    {formatMessage({ id: 'SharedGroupMembers' })} {memberCount}
                  </span>
                  <span className={style.dot}>·</span>
                  <span className={style.metaItem}>
                    {formatMessage({ id: 'SharedGroupDataSources' })} {dataSourceCount}
                  </span>
                  <span className={style.dot}>·</span>
                  <span className={style.metaItem}>
                    {formatMessage({ id: 'SharedGroupModulesLabel' })} {moduleCount}
                  </span>
                  {id != null && id !== '' ? <span className={style.id}>#{id}</span> : null}
                </Flex>

                {description ? <div className={style.description}>{description}</div> : null}
              </div>

              {actions ? (
                <div
                  className={style.actions}
                  onClick={event => {
                    event.stopPropagation();
                  }}
                >
                  {actions}
                </div>
              ) : null}
            </div>
          );
        })}
      </Flex>
    </div>
  );
};

export default SharedGroupMobileList;
