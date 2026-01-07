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
import style from './style.module.scss';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const defaultLeftInner = <LoginIllustration />;

const Layout = () => {
  return (
    <div className={classnames(style['layout-row'], 'account-layout')}>
      <div className={style['layout-inner']}>
        <div className={style['layout-inner-wrapper']}>
          <Outlet />
        </div>
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

  return (
    <Provider
      value={{
        baseUrl,
        ...props,
        loginUrl: `${baseUrl}/${props.loginPath}`,
        registerUrl: `${baseUrl}/${props.registerPath}`,
        forgetUrl: `${baseUrl}/${props.forgetPath}`
      }}>
      <div className={className}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to={props.loginUrl} />} />
            <Route path={props.loginPath} element={<Login />} />
            <Route path={props.registerPath} element={<Register />} />
            <Route path={props.forgetPath} element={<Forget />} />
            <Route path={`${props.resetPasswordPath}/:token`} element={<ResetPassword />} />
            <Route path={`${props.modifyPath}/:account`} element={<Modify />} />
          </Route>
        </Routes>
      </div>
    </Provider>
  );
};

export default withLocale(AccountInner);
