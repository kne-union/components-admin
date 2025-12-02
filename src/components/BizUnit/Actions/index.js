import { createWithRemoteLoader } from '@kne/remote-loader';
import Edit from './Edit';
import SetStatus from './SetStatus';
import Remove from './Remove';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, moreType, children, itemClassName, getActionList, getFormInner, data, apis, onSuccess, options, ...otherProps }) => {
  const [ButtonGroup] = remoteModules;
  const actionList = [];

  const props = {
    ...otherProps,
    data,
    apis,
    onSuccess,
    options,
    getFormInner
  };

  const otherActionList = typeof getActionList === 'function' ? getActionList(props) : [];

  if (props.apis.save) {
    actionList.push({
      ...props,
      name: 'save',
      buttonComponent: Edit
    });
  }

  if (props.apis.setStatus) {
    actionList.push(
      {
        ...props,
        name: 'setStatusOpen',
        buttonComponent: SetStatus,
        hidden: props.data?.status === 'open'
      },
      {
        ...props,
        name: 'setStatusClose',
        buttonComponent: SetStatus,
        hidden: props.data?.status === 'closed',
        message: props.options?.closeMessage || `确定要关闭${props.options?.bizName}吗？`,
        isDelete: false
      }
    );
  }

  if (props.apis.remove) {
    actionList.push({
      ...props,
      name: 'remove',
      buttonComponent: Remove,
      message: props.options?.removeMessage || `确定要删除${props.options?.bizName}吗？`
    });
  }

  if (Array.isArray(otherActionList) && otherActionList.length > 0) {
    otherActionList.forEach(({ index, ...item }) => {
      if (item.name) {
        const existItem = actionList.find(target => target.name === item.name);
        if (existItem) {
          Object.assign(existItem, item);
          return;
        }
      }
      item.buttonComponent && actionList.splice(item.index || 0, 0, item);
    });
  }

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
