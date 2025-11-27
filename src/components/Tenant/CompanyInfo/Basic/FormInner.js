import { createWithRemoteLoader } from '@kne/remote-loader';
import style from '../style.module.scss';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;

  return (
    <FormInfo
      className={style['form-section']}
      list={[
        <Input name="name" label="公司名称" rule="REQ LEN-0-100" />,
        <Input name="fullName" label="公司全称" rule="LEN-0-100" />,
        <Input name="website" label="公司主页" rule="LEN-0-500" block />,
        <TextArea name="description" label="公司简介" rule="LEN-0-5000" block />
      ]}
    />
  );
});

export default FormInner;
