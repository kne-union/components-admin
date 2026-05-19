import { createWithRemoteLoader } from '@kne/remote-loader';
import SelectTenant from './SelectTenant';
// 与 SelectTenant 共用样式；入口显式引用，确保 RemoteLoader 加载 Tenant@LoginTenant 时注入 CSS
import './style.module.scss';

const LoginTenant = createWithRemoteLoader({
  modules: ['components-core:Layout@Page']
})(({ remoteModules, children, ...props }) => {
  const [Page] = remoteModules;
  const pageProps = {
    backgroundColor: 'transparent',
    children: <SelectTenant {...props} />
  };
  if (typeof children === 'function') {
    return children(pageProps);
  }
  return <Page {...pageProps} />;
});

export default LoginTenant;

export { SelectTenant };
