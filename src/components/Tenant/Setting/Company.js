import { createWithRemoteLoader } from '@kne/remote-loader';
import CompanyInfo from '../CompanyInfo';
import Fetch from '@kne/react-fetch';
import { App } from 'antd';

const Company = createWithRemoteLoader({
  modules: ['components-core:Layout@Page', 'components-core:Global@usePreset', 'components-core:Permissions']
})(({ remoteModules, menu }) => {
  const [Page, usePreset, Permissions] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  return (
    <Page menu={menu} title="公司信息">
      <Permissions request={['setting:company-setting:view']} type="error">
        <Fetch
          {...Object.assign({}, apis.tenant.companyDetail)}
          render={({ data, reload }) => {
            return (
              <Permissions request={['setting:company-setting:edit']}>
                {({ isPass }) => {
                  return (
                    <CompanyInfo
                      data={data}
                      hasEdit={isPass}
                      onSubmit={async formData => {
                        const { data: resData } = await ajax(
                          Object.assign({}, apis.tenant.companySave, {
                            data: Object.assign({}, formData)
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
              </Permissions>
            );
          }}
        />
      </Permissions>
    </Page>
  );
});

export default Company;
