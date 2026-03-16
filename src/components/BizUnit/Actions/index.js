import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import Edit from './Edit';
import SetStatus from './SetStatus';
import Remove from './Remove';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(
  withLocale(
    ({
      remoteModules,
      moreType,
      children,
      itemClassName,
      getActionList,
      getFormInner,
      data,
      apis,
      onSuccess,
      options,
      fetchOptions,
      ...otherProps
    }) => {
      const { formatMessage } = useIntl();
      const [ButtonGroup] = remoteModules;
      const actionList = [];

      options = Object.assign(
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

      const props = {
        ...otherProps,
        fetchOptions,
        data,
        apis,
        onSuccess,
        options,
        getFormInner
      };

      const buttonOtherPropsMap = {
        save: {
          ...props,
          name: 'save',
          buttonComponent: Edit
        },
        setStatusOpen: {
          ...props,
          name: 'setStatusOpen',
          buttonComponent: SetStatus,
          hidden: props.data?.status === props.options?.openStatus || 'open'
        },
        setStatusClose: {
          ...props,
          name: 'setStatusClose',
          buttonComponent: SetStatus,
          hidden: props.data?.status === props.options?.closedStatus || 'closed',
          confirmMessage: props.options?.closeMessage || formatMessage({ id: 'ConfirmClose' }, { bizName: props.options?.bizName }),
          isDelete: false
        },
        remove: {
          ...props,
          name: 'remove',
          buttonComponent: Remove,
          confirmMessage: props.options?.removeMessage || formatMessage({ id: 'ConfirmDelete' }, { bizName: props.options?.bizName })
        }
      };

      const otherActionList = typeof getActionList === 'function' ? getActionList(props) : [];

      if (props.apis.save) {
        actionList.push(buttonOtherPropsMap.save);
      }

      if (props.apis.setStatus) {
        actionList.push(buttonOtherPropsMap.setStatusOpen, buttonOtherPropsMap.setStatusClose);
      }

      if (props.apis.remove) {
        actionList.push(buttonOtherPropsMap.remove);
      }

      if (Array.isArray(otherActionList) && otherActionList.length > 0) {
        otherActionList.reverse().forEach(({ index, ...item }) => {
          if (item.name) {
            const existItem = actionList.find(target => target.name === item.name);
            if (item.name === 'setStatusOpen') {
            }
            if (existItem) {
              Object.assign(existItem, typeof item.reset === 'function' ? item.reset(existItem) : item);
              return;
            }
          }
          actionList.splice(item.index || 0, 0, Object.assign({}, buttonOtherPropsMap[item.name], item));
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
    }
  )
);

export default Actions;
