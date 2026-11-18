import AppChildrenRouter from '@kne/app-children-router';
import RemoteLoader from '@kne/remote-loader';
import { Navigate } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import { AfterAdminUserLoginLayout } from '@components/Authenticate';
import { Provider } from './context';
import User from './User';
import PlatformManagement from './PlatformManagement';
import withLocale from './withLocale';

/**
 * 各应用通用的超管后台壳：内置用户 / 文件 / 消息 / 平台管理
 * （平台管理左栏含认证管理 + 平台关联；平台关联受 setting.appOpsEnabled 控制），
 * 业务通过 navigation.list 与 list 追加自定义模块。
 */
export const getBuiltinAdminNav = (baseUrl, formatMessage) => [
  {
    key: 'user',
    title: formatMessage({ id: 'NavUserManagement' }),
    path: `${baseUrl}/user`
  },
  {
    key: 'file',
    title: formatMessage({ id: 'NavFileManagement' }),
    path: `${baseUrl}/file`
  },
  {
    key: 'message',
    title: formatMessage({ id: 'NavMessageManagement' }),
    path: `${baseUrl}/message`
  },
  {
    key: 'platform',
    title: formatMessage({ id: 'NavPlatformManagement' }),
    path: `${baseUrl}/platform`
  }
];

export const getBuiltinAdminRoutes = (baseUrl, pageProps) => [
  {
    path: 'user/*',
    element: (
      <Provider value={{ baseUrl, pageProps }}>
        <User pageProps={pageProps} />
      </Provider>
    )
  },
  {
    path: 'file/*',
    element: <RemoteLoader module="components-file-manager:FileListPage" baseUrl={`${baseUrl}/file`} />
  },
  {
    path: 'message/*',
    element: <RemoteLoader module="components-admin:MessageManger" baseUrl={`${baseUrl}/message`} />
  },
  {
    path: 'platform/*',
    element: <PlatformManagement baseUrl={`${baseUrl}/platform`} pageProps={pageProps} />
  }
];

const AdminLayoutInner = ({ baseUrl = '/admin', defaultTitle, indexPath = 'user', navigation, list = [], pageProps, children, ...props }) => {
  const { formatMessage } = useIntl();
  const customNav = Array.isArray(navigation?.list) ? navigation.list : [];
  const mergedNavigation = Object.assign(
    {
      base: baseUrl,
      showIndex: false,
      defaultTitle
    },
    navigation,
    {
      list: [...customNav, ...getBuiltinAdminNav(baseUrl, formatMessage)]
    }
  );

  const targetIndex = `${baseUrl}/${indexPath}`.replace(/\/{2,}/g, '/');
  const routes = [
    {
      index: true,
      element: <Navigate to={targetIndex} replace />
    },
    ...list.filter(Boolean),
    ...getBuiltinAdminRoutes(baseUrl, pageProps)
  ];

  return (
    <AppChildrenRouter errorPage notFoundPage baseUrl={baseUrl} element={<AfterAdminUserLoginLayout {...props} navigation={mergedNavigation} />} list={routes}>
      {children}
    </AppChildrenRouter>
  );
};

const AdminLayout = withLocale(AdminLayoutInner);

export default AdminLayout;
