import { createWithRemoteLoader } from '@kne/remote-loader';
import Edit from './Edit';
import SetStatus from './SetStatus';
import Invite from './Invite';
import Remove from './Remove';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(withLocale(({ remoteModules, moreType, children, itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();
  const actionList = [
    {
      ...props,
      children: formatMessage({ id: 'EditUser' }),
      hidden: !props.apis.save,
      buttonComponent: Edit
    },
    {
      ...props,
      children: formatMessage({ id: 'InviteUser' }),
      buttonComponent: Invite,
      hidden: props.data?.userId
    },
    {
      ...props,
      children: formatMessage({ id: 'Open' }),
      buttonComponent: SetStatus,
      hidden: props.data?.status === 'open' || !props.apis.save
    },
    {
      ...props,
      children: formatMessage({ id: 'Close' }),
      buttonComponent: SetStatus,
      hidden: props.data?.status === 'closed' || !props.apis.save,
      message: formatMessage({ id: 'CloseUserConfirm' }),
      isDelete: false
    },
    {
      ...props,
      children: formatMessage({ id: 'Delete' }),
      buttonComponent: Remove,
      hidden: !props.apis.delete,
      message: formatMessage({ id: 'DeleteUserConfirm' })
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
}));

export default Actions;
