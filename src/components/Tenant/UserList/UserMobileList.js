import { Checkbox, Empty } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import { createWithRemoteLoader } from '@kne/remote-loader';
import Actions from './Actions';
import UserPersonalCard from './UserPersonalCard';
import style from './UserMobileList.module.scss';

const resolveRowId = (item, rowKey = 'id') => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);

// FlexBox 按容器 clientWidth 取第一个 width >= 容器宽度的项作为列数（对齐 AI 面试 TableListCard）
const DEFAULT_CARD_COLUMNS = [
  { width: 576, col: 1 },
  { width: 992, col: 2 },
  { width: 1400, col: 3 },
  { width: 1800, col: 4 }
];

/**
 * 租户用户列表卡片渲染：宽屏多列（PC renderCard），窄屏单列（移动端 renderMobile）
 */
const UserMobileList = createWithRemoteLoader({
  modules: ['components-core:FlexBox']
})(({ remoteModules, dataSource = [], rowKey = 'id', rowSelection, apis, getActions, onSuccess, showLength }) => {
  const [FlexBox] = remoteModules;
  const list = dataSource || [];

  if (!list.length) {
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
    <FlexBox
      outerClassName={classnames(style.grid, 'info-page-table-mobile-card-list')}
      dataSource={list}
      gutter={12}
      rowKey={item => resolveRowId(item, rowKey)}
      columns={DEFAULT_CARD_COLUMNS}
      defaultColumns={DEFAULT_CARD_COLUMNS}
      renderItem={item => {
        const id = resolveRowId(item, rowKey);
        const isChecked = selectedRowKeys.indexOf(id) > -1;
        const showCheckbox = rowSelection?.type === 'checkbox';

        return (
          <FlexBox.Item
            className={classnames(style.gridItem, 'info-page-table-mobile-card', {
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
                  <Actions
                    place="end"
                    type="link"
                    itemClassName="btn-no-padding"
                    moreType="link"
                    showLength={showLength}
                    data={item}
                    apis={apis}
                    onSuccess={onSuccess}
                  >
                    {getActions}
                  </Actions>
                </div>
              }
            />
          </FlexBox.Item>
        );
      }}
    />
  );
});

export default UserMobileList;
