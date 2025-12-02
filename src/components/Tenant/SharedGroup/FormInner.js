import { createWithRemoteLoader } from '@kne/remote-loader';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Input } = FormInfo.fields;

  return <FormInfo column={1} list={[<Input name="name" label="共享组名称" rule="REQ LEN-2-100" />]} />;
});

export default FormInner;
