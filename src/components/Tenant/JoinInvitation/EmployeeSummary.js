import { createWithRemoteLoader } from '@kne/remote-loader';
import { Tag } from 'antd';
import { MailOutlined, PhoneOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import getUserOrgDisplayItems from '../UserList/getUserOrgDisplayItems';
import buildRolesTitle from '../Role/buildRolesTitle';
import { getSourceIcon, getSourceLabel } from '../constants';
import style from './style.module.scss';

const resolveAvatarId = avatar => {
  if (avatar && typeof avatar === 'object') {
    return avatar.id || avatar.fileId || undefined;
  }
  return avatar || undefined;
};

/** 岗位可能存名称，也可能存 positionList 中的 id */
export const resolvePosition = (user, positionList) => {
  const value = user?.options?.position || user?.position;
  if (!value) {
    return '';
  }
  const matched = (positionList || []).find(item => String(item.id) === String(value));
  return matched ? matched.name : String(value);
};

export const UserAvatar = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, user, size = 56, className }) => {
  const [Image] = remoteModules;
  return <Image.Avatar className={className} id={resolveAvatarId(user?.avatar)} size={size} shape="circle" gender={user?.gender || 'M'} />;
});

const EmployeeSummary = withLocale(({ data, positionList }) => {
  const { formatMessage } = useIntl();
  const user = data || {};
  const orgs = getUserOrgDisplayItems(user);
  const position = resolvePosition(user, positionList);
  const roles = buildRolesTitle(user).split(',').filter(Boolean);
  const subtitle = [position, orgs[0]?.label].filter(Boolean).join(' · ');
  const fields = [
    { key: 'email', icon: <MailOutlined />, label: 'Email', value: user.email },
    { key: 'phone', icon: <PhoneOutlined />, label: 'Phone', value: user.phone },
    { key: 'org', icon: <ApartmentOutlined />, label: 'Department', value: orgs.map(org => org.path).join('、') }
  ].filter(item => item.value);

  return (
    <div className={style.company}>
      <div className={style.companyHead}>
        <UserAvatar user={user} />
        <div className={style.companyHeadBody}>
          <div className={style.companyName}>
            {user.name}
            {user.syncSource && (
              <Tag bordered={false} icon={getSourceIcon(user.syncSource)} className={style.employeeSource}>
                {getSourceLabel(user.syncSource)}
              </Tag>
            )}
          </div>
          {subtitle && <div className={style.companyFullName}>{subtitle}</div>}
          <div className={style.companyTags}>
            {(roles.length ? roles : [formatMessage({ id: 'DefaultRole' })]).map(role => (
              <Tag key={role} bordered={false} color="processing">
                {role}
              </Tag>
            ))}
          </div>
        </div>
      </div>
      {fields.length > 0 && (
        <div className={style.employeeFields}>
          {fields.map(item => (
            <div key={item.key} className={style.companyFieldFull}>
              <span className={style.companyFieldIcon}>{item.icon}</span>
              <span className={style.companyFieldLabel}>{formatMessage({ id: item.label })}</span>
              <span className={style.companyFieldValue} title={typeof item.value === 'string' ? item.value : undefined}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default EmployeeSummary;
