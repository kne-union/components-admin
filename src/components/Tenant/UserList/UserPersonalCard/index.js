import '@kne/react-box/dist/index.css';
import classnames from 'classnames';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { PersonalCard } from '@kne/react-box';
import { Typography } from 'antd';
import get from 'lodash/get';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import getUserOrgDisplayItems from '../getUserOrgDisplayItems';
import buildRolesTitle from '../../Role/buildRolesTitle';
import style from './style.module.scss';

/** 副标题单行省略，悬停展示完整内容 */
const renderEllipsisTitle = text => {
  if (!text) {
    return undefined;
  }
  return (
    <Typography.Text ellipsis={{ tooltip: text }} className={style.ellipsisTitle}>
      {text}
    </Typography.Text>
  );
};

const buildOrgMoreInfo = data =>
  getUserOrgDisplayItems(data).map(org => ({
    key: `org-${org.id}`,
    label: org.label,
    content: org.showPath ? org.path : org.label
  }));

const buildMoreInfo = (data, { formatMessage }) => {
  const roles = buildRolesTitle(data);
  const roleContent = roles || formatMessage?.({ id: 'DefaultRole' }) || '默认角色';

  const items = [
    {
      key: 'roles',
      label: formatMessage?.({ id: 'UserRole' }) || '角色',
      content: renderEllipsisTitle(roleContent)
    }
  ];

  const orgMoreInfo = buildOrgMoreInfo(data);
  if (orgMoreInfo.length > 1) {
    return items.concat(orgMoreInfo);
  }
  if (orgMoreInfo.length === 1) {
    const org = getUserOrgDisplayItems(data)[0];
    if (org.showPath) {
      return items.concat([
        {
          key: 'org-primary',
          label: formatMessage?.({ id: 'Department' }) || '部门',
          content: renderEllipsisTitle(org.path)
        }
      ]);
    }
    return items.concat(orgMoreInfo);
  }
  return items;
};

const applyPlugins = (moreInfo, data, context) => {
  const enhancer = get(context.plugins, 'tenantAdmin.personalCard');
  if (typeof enhancer === 'function') {
    return enhancer({ moreInfo, data, ...context }) ?? moreInfo;
  }
  return moreInfo;
};

/** 将用户数据映射为 PersonalCard 属性 */
const buildPersonalCardProps = (data, context = {}) => {
  const { Image, formatMessage, plugins } = context;

  let moreInfo = buildMoreInfo(data, { formatMessage });
  moreInfo = applyPlugins(moreInfo, data, { formatMessage, plugins });

  return {
    mode: 'horizontal',
    name: data?.name,
    email: data?.email,
    phone: data?.phone,
    description: data?.description,
    moreInfo,
    avatar: ({ className }) => <Image.Avatar className={className} id={data?.avatar} size={56} gender="M" />
  };
};

/** 租户用户 PersonalCard（邀请弹窗、加入确认等场景共用） */
const UserPersonalCard = createWithRemoteLoader({
  modules: ['components-core:Image', 'components-core:Global@usePreset']
})(({ remoteModules, data, className }) => {
  const [Image, usePreset] = remoteModules;
  const { plugins } = usePreset();
  const { formatMessage } = useIntl();

  if (!data) {
    return null;
  }

  return (
    <div className={classnames(style.wrap, className)}>
      <PersonalCard
        {...buildPersonalCardProps(data, { Image, formatMessage, plugins })}
      />
    </div>
  );
});

export default withLocale(UserPersonalCard);
