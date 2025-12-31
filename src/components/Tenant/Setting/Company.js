import { createWithRemoteLoader } from '@kne/remote-loader';
import CompanyInfo from '../CompanyInfo';
import Fetch from '@kne/react-fetch';
import { App } from 'antd';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const CompanyInner = createWithRemoteLoader({
  modules: ['components-core:Layout@Page', 'components-core:Global@usePreset', 'components-core:Permissions']
})(({ remoteModules, menu, children }) => {
  const [Page, usePreset, Permissions] = remoteModules;
  const { formatMessage } = useIntl();
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();

  const pageProps = {
    menu,
    title: formatMessage({ id: 'CompanyInfoPage' }),
    children: (
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
                        message.success(formatMessage({ id: 'CompanyInfoSaveSuccess' }));
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
    )
  };

  if (typeof children === 'function') {
    return children(pageProps);
  }
  return <Page {...pageProps} />;
});

export default withLocale(CompanyInner);
