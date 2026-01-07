import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import Edit from './Edit';
import SetStatus from './SetStatus';
import Remove from './Remove';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(withLocale(({ remoteModules, moreType, children, itemClassName, getActionList, getFormInner, data, apis, onSuccess, options, ...otherProps }) => {
  const { formatMessage } = useIntl();
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
        message: props.options?.closeMessage || formatMessage({ id: 'ConfirmClose' }, { bizName: props.options?.bizName }),
        isDelete: false
      }
    );
  }

  if (props.apis.remove) {
    actionList.push({
      ...props,
      name: 'remove',
      buttonComponent: Remove,
      message: props.options?.removeMessage || formatMessage({ id: 'ConfirmDelete' }, { bizName: props.options?.bizName })
    });
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
      actionList.splice(item.index || 0, 0, item);
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
}));

export default Actions;
