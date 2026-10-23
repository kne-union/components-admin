import { useState } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { App, Result, Button, Flex } from 'antd';
import dayjs from 'dayjs';
import withLocale from './withLocale';
import isManagedTenant from './isManagedTenant';
import { withPublicUrl } from '../../utils/publicUrl';
import { useIntl } from '@kne/react-intl';

const getTenantName = item => item?.tenant?.tenantCompany?.name || item?.tenant?.name || item?.tenantId;

/**
 * 读取租户身份失败时按可用租户分流：没有可用租户给出说明与切换账号；有则直接选择进入；可用租户也取不到时回到通用错误页。
 * OIDC 下普通租户换令牌重新授权；托管租户在 independent 子应用里由本地默认租户决定，只切默认租户
 */
const TenantUnavailable = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, error }) => {
  const [usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, ajax, oidc } = usePreset();
  const [switching, setSwitching] = useState(null);
  const referer = encodeURIComponent(window.location.pathname + window.location.search);
  const switchAccount = () => {
    if (oidc) {
      oidc.logout();
      return;
    }
    window.location.href = `${withPublicUrl('/account/login')}?referer=${referer}`;
  };
  const enterTenant = async item => {
    if (!oidc) {
      window.location.href = `${withPublicUrl('/login-tenant')}?referer=${referer}`;
      return;
    }
    setSwitching(String(item.tenantId));
    if (isManagedTenant(item.tenant)) {
      const { data: resData } = await ajax(Object.assign({}, apis.tenant.switchDefaultTenant, { data: { tenantId: item.tenantId } }));
      if (resData.code !== 0) {
        setSwitching(null);
        return;
      }
      window.location.reload();
      return;
    }
    Promise.resolve(oidc.switchTenant(item.tenantId, { returnTo: window.location.pathname + window.location.search })).finally(() => setSwitching(null));
  };
  const renderFailed = () => (
    <Result status="500" title={error || formatMessage({ id: 'UserInfoFetchFailed' })} subTitle={formatMessage({ id: 'ContactAdminOrAction' })}>
      <Flex gap={8} justify="center">
        <Button type="primary" onClick={switchAccount}>
          {formatMessage({ id: 'LoginOtherAccount' })}
        </Button>
        {!oidc && (
          <Button
            onClick={() => {
              window.location.href = `${withPublicUrl('/login-tenant')}?referer=${referer}`;
            }}>
            {formatMessage({ id: 'SwitchOtherTenant' })}
          </Button>
        )}
      </Flex>
    </Result>
  );
  if (!apis.tenant.availableList) {
    return renderFailed();
  }
  return (
    <Fetch
      {...Object.assign({}, apis.tenant.availableList)}
      error={renderFailed}
      render={({ data }) => {
        const list = (data?.list || []).filter(item => item.status === 'open');
        if (list.length === 0) {
          return (
            <Result status="403" title={formatMessage({ id: 'NoTenantIdentity' })} subTitle={formatMessage({ id: 'NoTenantIdentityDescription' })}>
              <Flex justify="center">
                <Button type="primary" onClick={switchAccount}>
                  {formatMessage({ id: 'SwitchAccount' })}
                </Button>
              </Flex>
            </Result>
          );
        }
        return (
          <Result status="warning" title={error || formatMessage({ id: 'UserInfoFetchFailed' })} subTitle={formatMessage({ id: 'SelectTenantToEnter' })}>
            <Flex vertical gap={8} align="center">
              {list.map(item => (
                <Button key={item.tenantId} block style={{ maxWidth: 320 }} loading={switching === String(item.tenantId)} disabled={!!switching} onClick={() => enterTenant(item)}>
                  {getTenantName(item)}
                </Button>
              ))}
              <Button type="link" onClick={switchAccount}>
                {formatMessage({ id: 'SwitchAccount' })}
              </Button>
            </Flex>
          </Result>
        );
      }}
    />
  );
});

const TenantUserInfo = createWithRemoteLoader({
  modules: ['components-core:Global@SetGlobal', 'components-core:Global@usePreset']
})(({ remoteModules, children }) => {
  const [SetGlobal, usePreset] = remoteModules;
  const { apis } = usePreset();
  const { notification } = App.useApp();
  const { formatMessage } = useIntl();
  return (
    <Fetch
      cache="tenant-user-info"
      {...Object.assign({}, apis.tenant.getUserInfo)}
      error={error => <TenantUnavailable error={error} />}
      render={({ data, reload }) => {
        const { serviceStartTime, serviceEndTime } = data.tenant;
        if (!(dayjs().isAfter(dayjs(serviceStartTime)) && dayjs().isBefore(dayjs(serviceEndTime).endOf('day')))) {
          notification.warning({
            message: formatMessage({ id: 'ImportantNotice' }),
            description: formatMessage({ id: 'ServicePeriodWarning' }, {
              startDate: dayjs(serviceStartTime).format('YYYY-MM-DD'),
              endDate: dayjs(serviceEndTime).format('YYYY-MM-DD')
            })
          });
        }
        return (
          <>
            <SetGlobal globalKey="themeToken" value={{ colorPrimary: data.tenant.themeColor }} />
            <SetGlobal globalKey="permissions" value={data.tenantUserInfo?.permissions} needReady>
              <SetGlobal
                globalKey="userInfo"
                value={{
                  tenantUserInfo: data.tenantUserInfo,
                  company: data.company,
                  tenant: data.tenant,
                  userInfo: data.userInfo,
                  reload
                }}
                needReady>
                {children}
              </SetGlobal>
            </SetGlobal>
          </>
        );
      }}
    />
  );
});

export default withLocale(TenantUserInfo);
