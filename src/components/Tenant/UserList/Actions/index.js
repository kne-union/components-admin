import { createWithRemoteLoader } from '@kne/remote-loader';
import Edit from './Edit';
import SetStatus from './SetStatus';
import Invite from './Invite';
import Remove from './Remove';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, moreType, children, itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const actionList = [
    {
      ...props,
      children: '编辑',
      buttonComponent: Edit
    },
    {
      ...props,
      children: '邀请',
      buttonComponent: Invite,
      hidden: props.data?.userId
    },
    {
      ...props,
      children: '开启',
      buttonComponent: SetStatus,
      hidden: props.data?.status === 'open'
    },
    {
      ...props,
      children: '关闭',
      buttonComponent: SetStatus,
      hidden: props.data?.status === 'closed',
      message: '确定要关闭用户吗？关闭后他将不能使用当前租户',
      isDelete: false
    },
    {
      ...props,
      children: '删除',
      buttonComponent: Remove,
      message: '确定要删除用户吗？删除后他将不能使用当前租户'
    }
  ];

  if (typeof children === 'function') {
    return children({
      itemClassName,
      moreType,
      list: actionList
    });
  }

  return <ButtonGroup itemClassName={itemClassName} list={actionList} moreType={moreType} />;
});

export default Actions;
