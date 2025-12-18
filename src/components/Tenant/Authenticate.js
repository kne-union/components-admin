import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { App, Result, Button, Flex } from 'antd';
import dayjs from 'dayjs';

const TenantUserInfo = createWithRemoteLoader({
  modules: ['components-core:Global@SetGlobal', 'components-core:Global@usePreset']
})(({ remoteModules, children }) => {
  const [SetGlobal, usePreset] = remoteModules;
  const { apis } = usePreset();
  const { notification } = App.useApp();
  return (
    <Fetch
      cache="tenant-user-info"
      {...Object.assign({}, apis.tenant.getUserInfo)}
      error={error => {
        const referer = encodeURIComponent(window.location.pathname + window.location.search);
        return (
          <Result status="500" title={error || '用户信息获取失败'} subTitle={'请联系管理员，或者进行以下操作'}>
            <Flex gap={8} justify="center">
              <Button
                type="primary"
                onClick={() => {
                  window.location.href = `/account/login?referer=${referer}`;
                }}>
                登录其他账号
              </Button>
              <Button onClick={()=>{
                window.location.href = `/login-tenant?referer=${referer}`
              }}>切换其他租户</Button>
            </Flex>
          </Result>
        );
      }}
      render={({ data, reload }) => {
        const { serviceStartTime, serviceEndTime } = data.tenant;
        if (!(dayjs().isAfter(dayjs(serviceStartTime)) && dayjs().isBefore(dayjs(serviceEndTime).endOf('day')))) {
          notification.warning({
            message: '重要通知',
            description: `您的系统服务期限为${dayjs(serviceStartTime).format('YYYY-MM-DD')}～${dayjs(serviceEndTime).format('YYYY-MM-DD')}，请联系管理员，超出服务期限系统可能会被禁用，目前暂时不影响使用`
          });
        }
        return (
          <>
            <SetGlobal globalKey="themeToken" value={{ colorPrimary: data.tenant.themeColor }} />
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
          </>
        );
      }}
    />
  );
});

export default TenantUserInfo;
