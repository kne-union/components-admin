import { createWithRemoteLoader } from '@kne/remote-loader';
import Save from './Save';
import SetStatus from './SetStatus';
import Remove from './Remove';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, moreType, children, itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;

  const actionList = [
    {
      type: 'primary',
      ...props,
      buttonComponent: Save,
      children: '编辑'
    },
    {
      ...props,
      buttonComponent: SetStatus,
      status: 'open',
      children: '开启',
      message: '确定要开启当前租户吗？',
      isDelete: false,
      hidden: props?.data.status !== 'closed'
    },
    {
      ...props,
      buttonComponent: SetStatus,
      status: 'closed',
      children: '关闭',
      message: '确定要关闭当前租户吗？',
      isDelete: false,
      hidden: props?.data.status !== 'open'
    },
    {
      ...props,
      buttonComponent: Remove,
      children: '删除',
      confirm: true
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
