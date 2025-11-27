import { createWithRemoteLoader } from '@kne/remote-loader';
import SelectTenant from './SelectTenant';
import style from './style.module.scss';

const LoginTenant = createWithRemoteLoader({
  modules: ['components-core:Layout@Page']
})(({ remoteModules, ...props }) => {
  const [Page] = remoteModules;
  return (
    <Page backgroundColor="transparent">
      <div className={style['card']}>
        <SelectTenant {...props} />
      </div>
    </Page>
  );
});

export default LoginTenant;

export { SelectTenant };
