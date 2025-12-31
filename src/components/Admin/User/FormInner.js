import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:FormInfo@formModule']
})(withLocale(({ remoteModules }) => {
  const [FormInfo, formModule] = remoteModules;
  const { formatMessage } = useIntl();
  const { Input, TextArea, PhoneNumber, Avatar } = formModule;
  return (
    <FormInfo
      column={1}
      list={[
        <Avatar name="avatar" label={formatMessage({ id: 'UserAvatar' })} labelHidden interceptor="photo-string" />,
        <Input name="nickname" label={formatMessage({ id: 'UserNickname' })} rule="LEN-0-100" />,
        <Input name="email" label={formatMessage({ id: 'UserEmail' })} rule="EMAIL ACCOUNT_IS_EXISTS" realtime />,
        <PhoneNumber name="phone" label={formatMessage({ id: 'UserPhone' })} rule="ACCOUNT_IS_EXISTS" format="string" />,
        <TextArea name="description" label={formatMessage({ id: 'UserDescription' })} />
      ]}
    />
  );
}));

export default FormInner;
