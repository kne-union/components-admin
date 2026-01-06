import { createWithRemoteLoader } from '@kne/remote-loader';
import SelectTenant from './SelectTenant';
import style from './style.module.scss';

const LoginTenant = createWithRemoteLoader({
  modules: ['components-core:Layout@Page']
})(({ remoteModules, children, ...props }) => {
  const [Page] = remoteModules;
  const pageProps = {
    children: (
      <div className={style['card']}>
        <SelectTenant {...props} />
      </div>
    )
  };
  if (typeof children === 'function') {
    return children(pageProps);
  }
  return <Page {...pageProps} />;
});

export default LoginTenant;

export { SelectTenant };
