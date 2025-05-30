import { createWithRemoteLoader } from '@kne/remote-loader';

const ResetPasswordFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Input } = FormInfo.fields;
  return (
    <FormInfo
      column={1}
      list={[
        <Input.Password name="password" label="密码" rule="REQ LEN-6-50" />,
        <Input.Password name="repeatPwd" label="重复密码" rule="REQ LEN-6-50 REPEAT-password" />
      ]}
    />
  );
});

export default ResetPasswordFormInner;
