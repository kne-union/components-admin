import { Empty } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import { createWithRemoteLoader } from '@kne/remote-loader';
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

const UserMobileList = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup', 'components-core:FlexBox']
})(({ remoteModules, dataSource = [], rowKey = 'id', getActions, showLength }) => {
  const [ButtonGroup, FlexBox] = remoteModules;
  const list = dataSource || [];

  if (!list.length) {
    return (
      <div className={style.empty}>
        <Empty />
      </div>
    );
  }

  return (
    <FlexBox
      outerClassName={classnames(style.grid, 'info-page-table-mobile-card-list')}
      dataSource={list}
      gutter={12}
      rowKey={item => resolveRowId(item, rowKey)}
      columns={DEFAULT_CARD_COLUMNS}
      defaultColumns={DEFAULT_CARD_COLUMNS}
      renderItem={item => {
        const actions = (typeof getActions === 'function' ? getActions(item) : [])
          .filter(action => action && !action.hidden)
          .map(action => Object.assign({ type: 'link' }, action));

        return (
          <FlexBox.Item className={classnames(style.gridItem, 'info-page-table-mobile-card')}>
            <UserPersonalCard
              data={item}
              footer={
                actions?.length ? (
                  <div className={style.actions}>
                    <ButtonGroup place="end" itemClassName="btn-no-padding" moreType="link" showLength={showLength} list={actions} />
                  </div>
                ) : null
              }
            />
          </FlexBox.Item>
        );
      }}
    />
  );
});

export default UserMobileList;
