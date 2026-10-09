import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import classnames from 'classnames';
import merge from 'lodash/merge';
import LoginIllustration from '@components/LoginIllustration';
import { Provider } from './context';
import Login from './Login';
import Register from './Register';
import Forget from './Forget';
import ResetPassword from './ResetPassword';
import Modify from './Modify';
import SsoConfig from './SsoConfig';
import style from './style.module.scss';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const defaultLeftInner = <LoginIllustration type="workforce" />;

export const Layout = ({ children }) => {
  return (
    <div className={classnames(style['layout-row'], 'account-layout')}>
      <div className={style['layout-inner']}>
        <div className={style['layout-inner-wrapper']}>{children || <Outlet />}</div>
      </div>
    </div>
  );
};

const AccountInner = ({ className, ...p }) => {
  const { formatMessage } = useIntl();
  const { baseUrl, ...props } = merge(
    {},
    {
      baseUrl: '',
      accountType: 'email',
      systemLogo: null,
      allowLanguageSwitch: true,
      systemName: formatMessage({ id: 'SystemName' }),
      loginTitle: formatMessage({ id: 'Login' }),
      registerTitle: formatMessage({ id: 'Register' }),
      loginLeftInner: defaultLeftInner,
      loginPath: 'login',
      registerPath: 'register',
      forgetPath: 'forget',
      resetPasswordPath: 'reset-password',
      modifyPath: 'modify',
      isTenant: false,
      storeKeys: {
        token: 'X-User-Token'
      }
    },
    p
  );

  const loginUrl = `${baseUrl}/${props.loginPath}`;

  // sso 直接取原始属性：lodash/merge 会深拷贝 sso.client
  return (
    <SsoConfig sso={p.sso}>
      {sso => {
        // central 子项目的密码由主项目管理，本地注册 / 找回 / 修改密码页不可用
        const passwordPage = element => (sso.enabled && sso.mode !== 'standalone' ? <Navigate to={loginUrl} replace /> : element);
        return (
          <Provider
            value={{
              baseUrl,
              ...props,
              sso,
              loginUrl,
              registerUrl: `${baseUrl}/${props.registerPath}`,
              forgetUrl: `${baseUrl}/${props.forgetPath}`
            }}>
            <div className={className}>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Navigate to={props.loginUrl} />} />
                  <Route path={props.loginPath} element={<Login />} />
                  <Route path={props.registerPath} element={passwordPage(<Register />)} />
                  <Route path={props.forgetPath} element={passwordPage(<Forget />)} />
                  <Route path={`${props.resetPasswordPath}/:token`} element={passwordPage(<ResetPassword />)} />
                  <Route path={`${props.modifyPath}/:account`} element={passwordPage(<Modify />)} />
                </Route>
              </Routes>
            </div>
          </Provider>
        );
      }}
    </SsoConfig>
  );
};

export default withLocale(AccountInner);
