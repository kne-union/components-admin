import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const ResetPasswordFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Input } = FormInfo.fields;
  return (
    <FormInfo
      column={1}
      list={[
        <Input.Password name="password" label={formatMessage({ id: 'Password' })} rule="REQ LEN-6-50" />,
        <Input.Password name="repeatPwd" label={formatMessage({ id: 'RepeatPassword' })} rule="REQ LEN-6-50 REPEAT-password" />
      ]}
    />
  );
}));

export default ResetPasswordFormInner;
