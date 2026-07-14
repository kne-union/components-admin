import { Empty, Flex, Tag } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import style from './RoleMobileList.module.scss';

const resolveRowId = (item, rowKey = 'id') => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);

const resolveOptionsColumn = columns => {
  if (!Array.isArray(columns)) {
    return null;
  }
  return columns.find(column => column?.name === 'options' || column?.renderType === 'options') || null;
};

const resolveTypeTag = (item, formatMessage) => {
  if (item?.type === 'system') {
    return { color: 'default', text: formatMessage({ id: 'SystemType' }) };
  }
  return { color: 'processing', text: formatMessage({ id: 'CustomType' }) };
};

/**
 * 角色列表移动端卡片：名称为主信息，类型/编码为次要信息，描述为辅助信息
 */
const RoleMobileList = ({ dataSource = [], columns, rowKey = 'id', context, empty, formatMessage }) => {
  if (!dataSource.length) {
    return <div className={style.empty}>{empty || <Empty />}</div>;
  }

  const optionsColumn = resolveOptionsColumn(columns);

  return (
    <div className={classnames(style.list, 'info-page-table-mobile-card-list')}>
      <Flex vertical gap={12}>
        {dataSource.map(item => {
          const id = resolveRowId(item, rowKey);
          const typeTag = resolveTypeTag(item, formatMessage);
          const actions = optionsColumn?.getValueOf?.(item, { context })?.children;
          const code = item?.code;
          const description = item?.description;

          return (
            <div key={id} className={classnames(style.card, 'info-page-table-mobile-card')}>
              <div className={style.body}>
                <div className={style.title}>{item?.name || '-'}</div>

                <Flex align="center" gap={8} wrap="wrap" className={style.meta}>
                  <Tag color={typeTag.color} className={style.type}>
                    {typeTag.text}
                  </Tag>
                  {code ? <span className={style.code}>{code}</span> : null}
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

export default RoleMobileList;
