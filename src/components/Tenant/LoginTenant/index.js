import SelectTenant from './SelectTenant';
// 与 SelectTenant 共用样式；入口显式引用，确保 RemoteLoader 加载 Tenant@LoginTenant 时注入 CSS
import './style.module.scss';

const LoginTenant = ({ children, ...props }) => {
  const pageProps = {
    backgroundColor: 'transparent',
    children: <SelectTenant {...props} />
  };
  if (typeof children === 'function') {
    return children(pageProps);
  }
  return pageProps.children;
};

export default LoginTenant;

export { SelectTenant };
