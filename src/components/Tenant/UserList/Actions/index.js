import { createWithRemoteLoader } from '@kne/remote-loader';
import Edit from './Edit';
import SetStatus from './SetStatus';
import Invite from './Invite';
import Remove from './Remove';
import BindThirdLogin from './BindThirdLogin';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import { listRemovableThirdLoginBindings } from '../listThirdLoginBindings';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(
  withLocale(({ remoteModules, moreType, children, itemClassName, showLength, place, className, ...props }) => {
    const [ButtonGroup] = remoteModules;
    const { formatMessage } = useIntl();
    const removableBindings = listRemovableThirdLoginBindings(props.data?.options, props.data?.syncSource);
    const canThirdLogin = props.apis.thirdLoginBindToken && props.apis.thirdLoginConfig;
    // className 须落到每个按钮：isNext options / 卡片 clone 会传入 options-btn
    const itemProps = {
      ...props,
      ...(className ? { className } : {})
    };
    const actionList = [
      {
        ...itemProps,
        children: formatMessage({ id: 'EditUser' }),
        hidden: !props.apis.save,
        buttonComponent: Edit
      },
      {
        ...itemProps,
        children: formatMessage({ id: 'InviteUser' }),
        buttonComponent: Invite,
        hidden: props.data?.userId
      },
      {
        ...itemProps,
        children: formatMessage({ id: 'ThirdLoginBind' }),
        buttonComponent: BindThirdLogin,
        mode: 'bind',
        hidden: !canThirdLogin
      },
      {
        ...itemProps,
        children: formatMessage({ id: 'ThirdLoginUnbind' }),
        buttonComponent: BindThirdLogin,
        mode: 'unbind',
        hidden: !canThirdLogin || !props.apis.thirdLoginUnbind || removableBindings.length === 0
      },
      {
        ...itemProps,
        children: formatMessage({ id: 'Open' }),
        buttonComponent: SetStatus,
        hidden: props.data?.status === 'open' || !props.apis.save
      },
      {
        ...itemProps,
        children: formatMessage({ id: 'Close' }),
        buttonComponent: SetStatus,
        hidden: props.data?.status === 'closed' || !props.apis.save,
        message: formatMessage({ id: 'CloseTenantUserConfirm' }),
        isDelete: false
      },
      {
        ...itemProps,
        children: formatMessage({ id: 'Delete' }),
        buttonComponent: Remove,
        hidden: !props.apis.delete,
        message: formatMessage({ id: 'DeleteUserConfirm' })
      }
    ];

    if (typeof children === 'function') {
      return children({
        ...props,
        className,
        place,
        itemClassName,
        moreType,
        showLength,
        list: actionList
      });
    }

    return (
      <ButtonGroup
        className={className}
        place={place}
        itemClassName={itemClassName}
        list={actionList}
        moreType={moreType}
        showLength={showLength}
      />
    );
  })
);

export default Actions;
