import { createWithRemoteLoader } from '@kne/remote-loader';
import style from '../style.module.scss';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;

  const { List } = FormInfo;
  const { Avatar, Input, TextArea } = FormInfo.fields;

  return (
    <List
      className={style['form-section']}
      name="teamDescription"
      list={[
        <Avatar name="avatar" label="头像" interceptor="photo-string" block />,
        <Input name="name" label="姓名" rule="REQ LEN-0-100" />,
        <Input name="role" label="角色" rule="REQ LEN-0-100" />,
        <TextArea name="description" label="简介" rule="LEN-0-500" block />
      ]}
    />
  );
});

export default FormInner;
