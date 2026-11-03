import { createWithRemoteLoader } from '@kne/remote-loader';
import { Tag, Empty, Spin, Avatar, Flex, Typography } from 'antd';
import { CheckOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import Fetch from '@kne/react-fetch';
import { useState } from 'react';
import classnames from 'classnames';
import withLocale from '../withLocale';
import isManagedTenant from '../isManagedTenant';
import TenantPageShell from '../TenantPageShell';
import { withPublicUrl } from '../../../utils/publicUrl';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';

const tenantInitial = name => {
  const text = String(name || '').trim();
  return text ? text.charAt(0).toUpperCase() : '?';
};

const getTenantDisplay = item => {
  const tenant = item?.tenant || {};
  const company = tenant.tenantCompany || {};

  return {
    logo: company.logo || tenant.logo,
    companyName: company.name || tenant.name || '',
    userName: item?.name || '',
    orgName: item?.tenantOrg?.name || ''
  };
};

const isSameTenant = (a, b) => a != null && b != null && String(a) === String(b);

// 托管租户在 independent 子应用里，当前租户由本地默认租户决定，令牌里的宿主租户不参与，换租户不需要重新授权
const usesTokenTenant = (oidc, item) => !!oidc && !isManagedTenant(item?.tenant);

const isCurrentTenantOf =
  ({ oidc, tokenTenantId, defaultTenantId }) =>
  item =>
    isSameTenant(item?.tenantId, usesTokenTenant(oidc, item) ? tokenTenantId : defaultTenantId);

const CurrentUser = withLocale(({ user }) => {
  const { formatMessage } = useIntl();
  const name = user && (user.nickname || user.email || user.phone);
  if (!name) {
    return null;
  }
  return (
    <Flex className={style.currentUser} align="center" gap={8}>
      <Avatar size="small" icon={<UserOutlined />} />
      <Typography.Text type="secondary">{formatMessage({ id: 'CurrentAccount' })}</Typography.Text>
      <Typography.Text ellipsis>{name}</Typography.Text>
    </Flex>
  );
});

const TenantCard = withLocale(({ Image, item, current, switching, onClick }) => {
  const { formatMessage } = useIntl();
  const display = getTenantDisplay(item);
  const disabled = item.status !== 'open';
  const meta = [display.userName, display.orgName].filter(Boolean).join(' · ');
  return (
    <div
      role="option"
      aria-selected={switching}
      aria-disabled={disabled}
      className={classnames(style.tenantCard, {
        [style.tenantCardActive]: switching,
        [style.tenantCardDisabled]: disabled
      })}
      onClick={onClick}
    >
      {display.logo ? (
        <Image.Avatar id={display.logo} size={40} className={style.tenantAvatarImage} />
      ) : (
        <span className={style.tenantAvatar} aria-hidden>
          {tenantInitial(display.companyName)}
        </span>
      )}
      <div className={style.tenantBody}>
        <div className={style.tenantName}>{display.companyName}</div>
        {meta && <div className={style.tenantMeta}>{meta}</div>}
      </div>
      {disabled ? (
        <Tag bordered={false} className={style.tenantTagMuted}>
          {formatMessage({ id: 'TenantUserCannotUse' })}
        </Tag>
      ) : current ? (
        <Tag color="processing" bordered={false} className={style.tenantTag}>
          {formatMessage({ id: 'CurrentTenant' })}
        </Tag>
      ) : null}
      {!disabled && (switching ? <CheckOutlined className={style.tenantCheck} /> : <RightOutlined className={style.tenantArrow} />)}
    </div>
  );
});

const TenantSelectContent = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Global@useGlobalContext', 'components-core:Image']
})(({ remoteModules, tenantPath, embedded }) => {
  const [usePreset, useGlobalContext, Image] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, ajax, oidc } = usePreset();
  const { global: userInfo } = useGlobalContext('userInfo');
  const [switchingId, setSwitchingId] = useState(null);

  return (
    <Flex vertical gap={24} className={classnames(style.content, { [style.contentEmbedded]: embedded })}>
      <div>
        <Typography.Title level={4} className={style.title}>
          {formatMessage({ id: 'SelectLoginTenant' })}
        </Typography.Title>
        <Typography.Text type="secondary">{formatMessage({ id: 'SelectLoginTenantSubtitle' })}</Typography.Text>
      </div>
      <CurrentUser user={userInfo?.value} />
      <Fetch
        {...Object.assign({}, apis.tenant.availableList)}
        render={({ data }) => {
          const list = data?.list || [];
          const tokenTenantId = oidc?.getTenantId?.();
          const isCurrentTenant = isCurrentTenantOf({ oidc, tokenTenantId, defaultTenantId: data?.defaultTenantId });

          if (list.length === 0) {
            return <Empty className={style.empty} image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'NoAvailableTenant' })} />;
          }

          const enter = async item => {
            if (item.status !== 'open' || switchingId) {
              return;
            }
            if (isCurrentTenant(item)) {
              window.location.href = withPublicUrl(tenantPath);
              return;
            }
            setSwitchingId(item.tenantId);
            // OIDC 下当前租户由令牌决定，换租户需重新签发令牌
            if (usesTokenTenant(oidc, item)) {
              oidc.switchTenant(item.tenantId, { returnTo: withPublicUrl(tenantPath) });
              return;
            }
            const { data: resData } = await ajax(Object.assign({}, apis.tenant.switchDefaultTenant, { data: { tenantId: item.tenantId } }));
            if (resData.code !== 0) {
              setSwitchingId(null);
              return;
            }
            window.location.href = withPublicUrl(tenantPath);
          };

          return (
            <Spin spinning={!!switchingId}>
              <div className={style.tenantList} role="listbox" aria-label={formatMessage({ id: 'SelectLoginTenant' })}>
                {list.map(item => (
                  <TenantCard
                    key={item.id}
                    Image={Image}
                    item={item}
                    current={isCurrentTenant(item)}
                    switching={isSameTenant(item.tenantId, switchingId)}
                    onClick={() => enter(item)}
                  />
                ))}
              </div>
            </Spin>
          );
        }}
      />
    </Flex>
  );
});

// embedded：嵌入宿主 Page（如 @kne/system-layout）时只渲染选择内容，不带外壳
export default withLocale(({ embedded, systemName, systemLogo, ...props }) =>
  embedded ? (
    <TenantSelectContent {...props} embedded />
  ) : (
    <TenantPageShell systemName={systemName} systemLogo={systemLogo}>
      <TenantSelectContent {...props} />
    </TenantPageShell>
  )
);
