import get from 'lodash/get';
import { Typography } from 'antd';
import getUserOrgDisplayItems from '../getUserOrgDisplayItems';
import normalizeTenantUserForPersonalCard from '../normalizeTenantUserForPersonalCard';
import { resolvePositionDisplayName } from '../buildUserListWithPositionList';
import style from './personalCard.module.scss';

/** 副标题单行省略，悬停展示完整内容 */
export const renderPersonalCardEllipsisTitle = text => {
  if (!text) {
    return undefined;
  }
  return (
    <Typography.Text ellipsis={{ tooltip: text }} className={style.personalCardTitle}>
      {text}
    </Typography.Text>
  );
};

const buildRolesTitle = data => {
  const roles = Array.isArray(data?.roles) && data.roles.length ? data.roles : data?.roleDetails;
  if (!Array.isArray(roles) || !roles.length) {
    return '';
  }
  return roles
    .map(item => (typeof item === 'string' ? item : item?.name))
    .filter(Boolean)
    .join('、');
};

const buildOrgMoreInfo = data =>
  getUserOrgDisplayItems(data).map(org => {
    const path = org.fullPath || org.label;
    const showPath = path && org.label && path !== org.label;
    return {
      key: `org-${org.id}`,
      label: org.label,
      content: showPath ? path : org.label
    };
  });

const insertAfterKey = (items, key, entry) => {
  const index = items.findIndex(item => item.key === key);
  const next = items.slice();
  next.splice(index >= 0 ? index + 1 : 0, 0, entry);
  return next;
};

const appendPositionMoreInfo = (moreInfo, data, { formatMessage, positionList }) => {
  if (moreInfo.some(item => item.key === 'position')) {
    return moreInfo;
  }
  const positionName = resolvePositionDisplayName(data, positionList);
  if (!positionName) {
    return moreInfo;
  }
  return insertAfterKey(moreInfo, 'roles', {
    key: 'position',
    label: formatMessage?.({ id: 'Position' }) || '岗位',
    content: renderPersonalCardEllipsisTitle(positionName)
  });
};

const buildRolesAndOrgMoreInfo = (data, { formatMessage }) => {
  const roles = buildRolesTitle(data);
  const roleContent =
    roles || formatMessage?.({ id: 'DefaultRole' }) || '默认角色';

  const items = [
    {
      key: 'roles',
      label: formatMessage?.({ id: 'UserRole' }) || '角色',
      content: renderPersonalCardEllipsisTitle(roleContent)
    }
  ];

  const orgMoreInfo = buildOrgMoreInfo(data);
  if (orgMoreInfo.length > 1) {
    return items.concat(orgMoreInfo);
  }
  if (orgMoreInfo.length === 1) {
    const org = getUserOrgDisplayItems(data)[0];
    const path = org?.fullPath || org?.label;
    if (path && org?.label && path !== org.label) {
      return items.concat([
        {
          key: 'org-primary',
          label: formatMessage?.({ id: 'Department' }) || '部门',
          content: renderPersonalCardEllipsisTitle(path)
        }
      ]);
    }
    return items.concat(orgMoreInfo);
  }
  return items;
};

const applyPersonalCardPlugins = (moreInfo, data, context) => {
  let next = moreInfo;
  const enhancer = get(context.plugins, 'tenantAdmin.personalCard');
  if (typeof enhancer === 'function') {
    next = enhancer({ moreInfo: next, data, ...context }) ?? next;
  }
  return appendPositionMoreInfo(next, data, context);
};

/** 将用户列表行 / 邀请数据映射为 PersonalCard 属性 */
const buildInvitePersonalCardProps = (data, context = {}) => {
  const { Image, formatMessage, positionList, plugins } = context;
  const normalized = normalizeTenantUserForPersonalCard(data);

  let moreInfo = buildRolesAndOrgMoreInfo(normalized, { formatMessage });
  moreInfo = applyPersonalCardPlugins(moreInfo, normalized, {
    formatMessage,
    positionList,
    plugins
  });

  const positionName = resolvePositionDisplayName(normalized, positionList);
  const titleText = positionName || undefined;

  return {
    mode: 'horizontal',
    name: normalized?.name,
    title: renderPersonalCardEllipsisTitle(titleText),
    email: normalized?.email,
    phone: normalized?.phone,
    description: normalized?.description,
    moreInfo,
    avatar: ({ className }) => <Image.Avatar className={className} id={normalized?.avatar} size={56} gender="M" />
  };
};

export default buildInvitePersonalCardProps;
