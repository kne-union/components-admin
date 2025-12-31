import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { App, Result, Button, Flex } from 'antd';
import dayjs from 'dayjs';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';

const TenantUserInfo = createWithRemoteLoader({
  modules: ['components-core:Global@SetGlobal', 'components-core:Global@usePreset']
})(({ remoteModules, children }) => {
  const [SetGlobal, usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis } = usePreset();
  const { notification } = App.useApp();
  return (
    <Fetch
      cache="tenant-user-info"
      {...Object.assign({}, apis.tenant.getUserInfo)}
      error={error => {
        const referer = encodeURIComponent(window.location.pathname + window.location.search);
        return (
          <Result status="500" title={error || formatMessage({ id: 'UserInfoFetchFailed' })} subTitle={formatMessage({ id: 'ContactAdminOrAction' })}>
            <Flex gap={8} justify="center">
              <Button
                type="primary"
                onClick={() => {
                  window.location.href = `/account/login?referer=${referer}`;
                }}>
                {formatMessage({ id: 'LoginOtherAccount' })}
              </Button>
              <Button
                onClick={() => {
                  window.location.href = `/login-tenant?referer=${referer}`;
                }}>
                {formatMessage({ id: 'SwitchOtherTenant' })}
              </Button>
            </Flex>
          </Result>
        );
      }}
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
