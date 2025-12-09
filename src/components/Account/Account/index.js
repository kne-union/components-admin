import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import classnames from 'classnames';
import merge from 'lodash/merge';
import { Provider } from './context';
import Login from './Login';
import Register from './Register';
import Forget from './Forget';
import ResetPassword from './ResetPassword';
import Modify from './Modify';
import style from './style.module.scss';

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

const Account = ({ className, ...p }) => {
  const { baseUrl, ...props } = merge(
    {},
    {
      baseUrl: '',
      accountType: 'email',
      systemLogo: null,
      systemName: 'Kne Union SaaS System',
      loginTitle: '登录',
      registerTitle: '注册',
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
      }}
    >
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

export default Account;
