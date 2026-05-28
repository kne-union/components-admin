import { createWithRemoteLoader } from '@kne/remote-loader';
import { CompanyInfo } from '@components/Tenant';
import Fetch from '@kne/react-fetch';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';

const Company = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(withLocale(({ remoteModules, tenant }) => {
  const [usePreset] = remoteModules;
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
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
              message.success(formatMessage({ id: 'CompanyInfoSaveSuccess' }));
              reload();
            }}
          />
        );
      }}
    />
  );
}));

export default Company;
