import { Checkbox, Empty, Flex } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import Actions from './Actions';
import UserPersonalCard from './UserPersonalCard';
import style from './UserMobileList.module.scss';

const resolveRowId = (item, rowKey = 'id') => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);

/**
 * 租户用户列表移动端渲染：人物卡片内含 Checkbox + 操作入口
 */
const UserMobileList = ({ dataSource = [], rowKey = 'id', rowSelection, apis, getActions, onSuccess }) => {
  if (!dataSource.length) {
    return (
      <div className={style.empty}>
        <Empty />
      </div>
    );
  }

  const selectedRowKeys = rowSelection?.selectedRowKeys || [];

  const toggleSelect = (item, id, isChecked) => {
    if (!rowSelection || item.disabled || rowSelection.isSelectedAll) {
      return;
    }
    const checked = !isChecked;
    // useSelectedRow 返回 onSelect；getRowSelection / adaptRowSelection 才有 onChange
    if (typeof rowSelection.onSelect === 'function') {
      rowSelection.onSelect(item, checked);
      return;
    }
    if (typeof rowSelection.onChange !== 'function') {
      return;
    }
    if (rowSelection.type === 'radio') {
      rowSelection.onChange(isChecked ? [] : [id], id, { checked });
      return;
    }
    const nextKeys = isChecked ? selectedRowKeys.filter(key => key !== id) : [...selectedRowKeys, id];
    rowSelection.onChange(nextKeys, id, { checked });
  };

  return (
    <div className={classnames(style.list, 'info-page-table-mobile-card-list')}>
      <Flex vertical gap={12}>
        {dataSource.map(item => {
          const id = resolveRowId(item, rowKey);
          const isChecked = selectedRowKeys.indexOf(id) > -1;
          const showCheckbox = rowSelection?.type === 'checkbox';

          return (
            <div
              key={id}
              className={classnames(style.item, 'info-page-table-mobile-card', {
                'is-mobile-card-selected': isChecked
              })}
            >
              <UserPersonalCard
                data={item}
                mode="vertical"
                selected={isChecked}
                extra={
                  showCheckbox ? (
                    <Checkbox
                      disabled={item.disabled || rowSelection.isSelectedAll}
                      checked={(rowSelection.isSelectedAll && !item.disabled) || isChecked}
                      onChange={() => toggleSelect(item, id, isChecked)}
                    />
                  ) : null
                }
                footer={
                  <div className={style.actions}>
                    <Actions type="link" itemClassName="btn-no-padding" moreType="link" data={item} apis={apis} onSuccess={onSuccess}>
                      {getActions}
                    </Actions>
                  </div>
                }
              />
            </div>
          );
        })}
      </Flex>
    </div>
  );
};

export default UserMobileList;
