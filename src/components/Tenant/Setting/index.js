import { createWithRemoteLoader } from '@kne/remote-loader';
import { Navigate } from 'react-router-dom';
import AppChildrenRouter from '@kne/app-children-router';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import Company from './Company';
import Org from './Org';
import User from './User';
import Permission from './Permission';
import Mail from './Mail';
import Mfa from './Mfa';

const Setting = createWithRemoteLoader({
  modules: ['components-core:Layout@Menu']
})(
  withLocale(({ remoteModules, apis, baseUrl: originalBaseUrl, pageProps }) => {
    const baseUrl = `${originalBaseUrl}/setting`;
    const [Menu] = remoteModules;
    const { formatMessage } = useIntl();
    const menu = (
      <Menu
        items={[
          { key: 'company', label: formatMessage({ id: 'CompanyInfoPage' }), path: `${baseUrl}/company`, request: ['setting:company-setting'] },
          {
            key: 'org',
            label: formatMessage({ id: 'OrgStructure' }),
            path: `${baseUrl}/org`,
            request: ['setting:org']
          },
          {
            key: 'permission',
            label: formatMessage({ id: 'PermissionManagement' }),
            path: `${baseUrl}/permission`,
            request: ['setting:permission']
          },
          {
            key: 'user',
            label: formatMessage({ id: 'UserManagement' }),
            path: `${baseUrl}/user`,
            request: ['setting:user-manager']
          },
          {
            key: 'mail',
            label: formatMessage({ id: 'MailSettingPage' }),
            path: `${baseUrl}/mail`,
            request: ['setting:mail-setting']
          },
          {
            key: 'mfa',
            label: formatMessage({ id: 'MfaSettingPage' }),
            path: `${baseUrl}/mfa`,
            request: ['setting:mfa-setting']
          }
        ]}
      />
    );

    return (
      <AppChildrenRouter
        baseUrl={`${baseUrl}`}
        list={[
          {
            index: true,
            element: <Navigate to={`${baseUrl}/company`} replace />
          },
          {
            path: 'company',
            element: <Company menu={menu} pageProps={pageProps} baseUrl={baseUrl} />
          },
          {
            path: 'org',
            element: <Org menu={menu} pageProps={pageProps} baseUrl={baseUrl} />
          },
          {
            path: 'permission',
            element: <Permission menu={menu} pageProps={pageProps} baseUrl={baseUrl} />
          },
          {
            path: 'user',
            element: <User menu={menu} apis={apis} pageProps={pageProps} baseUrl={baseUrl} />
          },
          {
            path: 'mail',
            element: <Mail menu={menu} pageProps={pageProps} baseUrl={baseUrl} />
          },
          {
            path: 'mfa',
            element: <Mfa menu={menu} pageProps={pageProps} baseUrl={baseUrl} />
          }
        ]}
      />
    );
  })
);

Setting.Company = Company;
Setting.Org = Org;
Setting.User = User;
Setting.Permission = Permission;
Setting.Mail = Mail;
Setting.Mfa = Mfa;

export default Setting;
