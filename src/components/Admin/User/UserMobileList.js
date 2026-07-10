import { Empty, Flex } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import { createWithRemoteLoader } from '@kne/remote-loader';
import UserPersonalCard from './UserPersonalCard';
import style from './UserMobileList.module.scss';

const resolveRowId = (item, rowKey = 'id') => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);

const UserMobileList = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, dataSource = [], rowKey = 'id', getActions }) => {
  const [ButtonGroup] = remoteModules;

  if (!dataSource.length) {
    return (
      <div className={style.empty}>
        <Empty />
      </div>
    );
  }

  return (
    <div className={classnames(style.list, 'info-page-table-mobile-card-list')}>
      <Flex vertical gap={12}>
        {dataSource.map(item => {
          const id = resolveRowId(item, rowKey);
          const actions = (typeof getActions === 'function' ? getActions(item) : [])
            .filter(action => action && !action.hidden)
            .map(action => Object.assign({ type: 'link' }, action));

          return (
            <div key={id} className={classnames(style.item, 'info-page-table-mobile-card')}>
              <UserPersonalCard
                data={item}
                footer={
                  actions?.length ? (
                    <div className={style.actions}>
                      <ButtonGroup itemClassName="btn-no-padding" moreType="link" list={actions} />
                    </div>
                  ) : null
                }
              />
            </div>
          );
        })}
      </Flex>
    </div>
  );
});

export default UserMobileList;
