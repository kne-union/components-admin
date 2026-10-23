import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import { isManagedTenant } from '@components/Tenant';
import withLocale from '../withLocale';
import Save from './Save';
import SetStatus from './SetStatus';
import Remove from './Remove';

const ActionsInner = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, moreType, children, itemClassName, showLength, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const { formatMessage } = useIntl();
  // 宿主同步的租户：基本信息、状态与删除以宿主为准
  const managed = isManagedTenant(props?.data);

  const actionList = [
    {
      type: 'primary',
      ...props,
      buttonComponent: Save,
      children: formatMessage({ id: 'Edit' }),
      hidden: managed
    },
    {
      ...props,
      buttonComponent: SetStatus,
      status: 'open',
      children: formatMessage({ id: 'Open' }),
      message: formatMessage({ id: 'OpenTenantConfirm' }),
      isDelete: false,
      hidden: managed || props?.data.status !== 'closed'
    },
    {
      ...props,
      buttonComponent: SetStatus,
      status: 'closed',
      children: formatMessage({ id: 'Close' }),
      message: formatMessage({ id: 'CloseTenantConfirm' }),
      isDelete: false,
      hidden: managed || props?.data.status !== 'open'
    },
    {
      ...props,
      buttonComponent: Remove,
      children: formatMessage({ id: 'Delete' }),
      confirm: true,
      hidden: managed
    }
  ];

  if (typeof children === 'function') {
    return children({
      itemClassName,
      moreType,
      showLength,
      list: actionList
    });
  }

  return <ButtonGroup itemClassName={itemClassName} list={actionList} moreType={moreType} showLength={showLength} />;
});

export default withLocale(ActionsInner);
