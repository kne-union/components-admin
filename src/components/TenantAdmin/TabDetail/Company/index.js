import { createWithRemoteLoader } from '@kne/remote-loader';
import { CompanyInfo } from '@components/Tenant';
import Fetch from '@kne/react-fetch';
import { App } from 'antd';

const Company = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, tenant }) => {
  const [usePreset] = remoteModules;
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <Fetch
      {...Object.assign({}, apis.tenantAdmin.companyDetail, {
        params: { tenantId: tenant.id }
      })}
      render={({ data, reload }) => {
        return (
          <CompanyInfo
            data={data}
            onSubmit={async formData => {
              const { data: resData } = await ajax(
                Object.assign({}, apis.tenantAdmin.companySave, {
                  data: Object.assign({}, formData, {
                    tenantId: tenant.id
                  })
                })
              );
              if (resData.code !== 0) {
                return false;
              }
              message.success('公司信息保存成功');
              reload();
            }}
          />
        );
      }}
    />
  );
});

export default Company;
