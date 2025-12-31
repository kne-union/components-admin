import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import Save from './Save';
import SetStatus from './SetStatus';
import Remove from './Remove';

const ActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, moreType, children, itemClassName, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();

  const actionList = [
    {
      type: 'primary',
      ...props,
      buttonComponent: Save,
      children: formatMessage({ id: 'Edit' })
    },
    {
      ...props,
      buttonComponent: SetStatus,
      status: 'open',
      children: formatMessage({ id: 'Open' }),
      message: formatMessage({ id: 'OpenTenantConfirm' }),
      isDelete: false,
      hidden: props?.data.status !== 'closed'
    },
    {
      ...props,
      buttonComponent: SetStatus,
      status: 'closed',
      children: formatMessage({ id: 'Close' }),
      message: formatMessage({ id: 'CloseTenantConfirm' }),
      isDelete: false,
      hidden: props?.data.status !== 'open'
    },
    {
      ...props,
      buttonComponent: Remove,
      children: formatMessage({ id: 'Delete' }),
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

export default withLocale(ActionsInner);
