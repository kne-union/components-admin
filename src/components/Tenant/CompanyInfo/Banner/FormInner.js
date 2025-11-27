import { createWithRemoteLoader } from '@kne/remote-loader';
import style from '../style.module.scss';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Upload } = FormInfo.fields;
  return <FormInfo className={style['form-section']} list={[<Upload name="banners" label="Banner" interceptor="photo-string-list" block />]} />;
});

export default FormInner;
