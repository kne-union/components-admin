import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const ContactFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { Avatar, Input, TextArea } = FormInfo.fields;
    const { formatMessage } = useIntl();
    return (
      <FormInfo
        column={1}
        list={[
          <Avatar name="avatar" label={formatMessage({ id: 'Avatar' })} labelHidden interceptor="photo-string" directory="Avatar" />,
          <Input name="name" label={formatMessage({ id: 'ContactName' })} rule="LEN-0-50" />,
          <Input name="address" label={formatMessage({ id: 'ContactAddress' })} rule="REQ EMAIL" />,
          <TextArea name="remark" label={formatMessage({ id: 'Remark' })} rule="LEN-0-500" />
        ]}
      />
    );
  })
);

export const toContactPayload = formData => ({
  name: formData.name || '',
  address: formData.address,
  avatar: formData.avatar || '',
  remark: formData.remark || ''
});

export default ContactFormInner;
