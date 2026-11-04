import { isManagedTenant } from '@components/Tenant';
import Save from './Save';
import SetStatus from './SetStatus';
import Remove from './Remove';

/**
 * 生成租户操作列的动作数组（纯函数，不做渲染）
 * table-view 的 options 渲染器只接受动作数组 / { list }，列配置必须返回数组
 */
const buildActionList = ({ formatMessage, data, ...props }) => {
  // 宿主同步的租户：基本信息、状态与删除以宿主为准
  const managed = isManagedTenant(data);
  const actionProps = { ...props, data };

  return [
    {
      type: 'primary',
      ...actionProps,
      buttonComponent: Save,
      children: formatMessage({ id: 'Edit' }),
      hidden: managed
    },
    {
      ...actionProps,
      buttonComponent: SetStatus,
      status: 'open',
      children: formatMessage({ id: 'Open' }),
      message: formatMessage({ id: 'OpenTenantConfirm' }),
      isDelete: false,
      hidden: managed || data?.status !== 'closed'
    },
    {
      ...actionProps,
      buttonComponent: SetStatus,
      status: 'closed',
      children: formatMessage({ id: 'Close' }),
      message: formatMessage({ id: 'CloseTenantConfirm' }),
      isDelete: false,
      hidden: managed || data?.status !== 'open'
    },
    {
      ...actionProps,
      buttonComponent: Remove,
      children: formatMessage({ id: 'Delete' }),
      confirm: true,
      hidden: managed
    }
  ];
};

export default buildActionList;
