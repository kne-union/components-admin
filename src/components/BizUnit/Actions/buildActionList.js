import Edit from './Edit';
import SetStatus from './SetStatus';
import Remove from './Remove';

/**
 * 生成操作列的动作列表（纯函数，不做任何渲染）
 * table-view 的 options 渲染器只接受动作数组，所以「构建列表」必须和「渲染」解耦，
 * 不能再像旧版那样塞一个 <Actions/> 元素进去。
 */
const buildActionList = ({ formatMessage, apis, options, getActionList, getFormInner, onSuccess, data, fetchOptions, ...otherProps }) => {
  const actionOptions = Object.assign(
    {},
    {
      editButtonProps: {
        children: formatMessage({ id: 'Edit' })
      },
      removeButtonProps: {
        children: formatMessage({ id: 'Delete' })
      },
      openButtonProps: {
        children: formatMessage({ id: 'Open' })
      },
      closeButtonProps: {
        children: formatMessage({ id: 'Close' })
      }
    },
    options
  );

  const props = Object.assign({}, otherProps, {
    fetchOptions,
    data,
    apis,
    onSuccess,
    options: actionOptions,
    getFormInner
  });

  const actionList = [];

  const buttonOtherPropsMap = {
    save: {
      ...props,
      name: 'save',
      type: 'link',
      buttonComponent: Edit
    },
    setStatusOpen: {
      ...props,
      name: 'setStatusOpen',
      type: 'link',
      buttonComponent: SetStatus,
      hidden: props.data?.status === (props.options?.openStatus ?? 'open')
    },
    setStatusClose: {
      ...props,
      name: 'setStatusClose',
      type: 'link',
      buttonComponent: SetStatus,
      hidden: props.data?.status === (props.options?.closedStatus ?? 'closed'),
      confirmMessage: props.options?.closeMessage || formatMessage({ id: 'ConfirmClose' }, { bizName: props.options?.bizName }),
      isDelete: false
    },
    remove: {
      ...props,
      name: 'remove',
      type: 'link',
      buttonComponent: Remove,
      confirmMessage: props.options?.removeMessage || formatMessage({ id: 'ConfirmDelete' }, { bizName: props.options?.bizName })
    }
  };

  const otherActionList = typeof getActionList === 'function' ? getActionList(props) : [];

  if (props.apis?.save) {
    actionList.push(buttonOtherPropsMap.save);
  }

  if (props.apis?.setStatus) {
    actionList.push(buttonOtherPropsMap.setStatusOpen, buttonOtherPropsMap.setStatusClose);
  }

  if (props.apis?.remove) {
    actionList.push(buttonOtherPropsMap.remove);
  }

  if (Array.isArray(otherActionList) && otherActionList.length > 0) {
    otherActionList.reverse().forEach(({ index, ...item }) => {
      if (item.name) {
        const existItem = actionList.find(target => target.name === item.name);
        if (existItem) {
          Object.assign(existItem, typeof item.reset === 'function' ? item.reset(existItem) : item);
          return;
        }
      }
      // index 已从 item 解构出，必须用局部变量；item.index 恒为 undefined
      actionList.splice(index ?? 0, 0, Object.assign({ type: 'link' }, buttonOtherPropsMap[item.name], item));
    });
  }

  return actionList;
};

export default buildActionList;
