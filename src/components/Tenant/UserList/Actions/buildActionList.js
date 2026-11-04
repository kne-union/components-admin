import Edit from './Edit';
import SetStatus from './SetStatus';
import Invite from './Invite';
import Remove from './Remove';
import BindThirdLogin from './BindThirdLogin';
import { listRemovableThirdLoginBindings } from '../listThirdLoginBindings';

/**
 * 生成租户用户操作列的动作数组（纯函数，不做渲染）
 * table-view 的 options 渲染器只接受动作数组 / { list }，列配置必须返回数组
 */
const buildActionList = ({ formatMessage, apis, data, className, ...props }) => {
  const removableBindings = listRemovableThirdLoginBindings(data?.options, data?.syncSource);
  const canThirdLogin = apis.thirdLoginBindToken && apis.thirdLoginConfig;
  // className 须落到每个按钮：options 渲染器会把 options-btn 透传到列配置这一层
  const itemProps = {
    ...props,
    ...(className ? { className } : {}),
    apis,
    data
  };

  return [
    {
      ...itemProps,
      children: formatMessage({ id: 'EditUser' }),
      hidden: !apis.save,
      buttonComponent: Edit
    },
    {
      ...itemProps,
      children: formatMessage({ id: 'InviteUser' }),
      buttonComponent: Invite,
      hidden: data?.userId
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
      hidden: !canThirdLogin || !apis.thirdLoginUnbind || removableBindings.length === 0
    },
    {
      ...itemProps,
      children: formatMessage({ id: 'Open' }),
      buttonComponent: SetStatus,
      hidden: data?.status === 'open' || !apis.save
    },
    {
      ...itemProps,
      children: formatMessage({ id: 'Close' }),
      buttonComponent: SetStatus,
      hidden: data?.status === 'closed' || !apis.save,
      message: formatMessage({ id: 'CloseTenantUserConfirm' }),
      isDelete: false
    },
    {
      ...itemProps,
      children: formatMessage({ id: 'Delete' }),
      buttonComponent: Remove,
      hidden: !apis.delete,
      message: formatMessage({ id: 'DeleteUserConfirm' })
    }
  ];
};

export default buildActionList;
