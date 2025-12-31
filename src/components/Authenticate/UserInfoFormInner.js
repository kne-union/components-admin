import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import { Flex } from 'antd';

const UserInfoFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules, ...props }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Avatar, Input, TextArea } = FormInfo.fields;
  return (
    <FormInfo
      {...props}
      list={[
        <Flex justify="center">
          <Avatar name="avatar" label={formatMessage({ id: 'Avatar' })} labelHidden interceptor="photo-string" />
        </Flex>,
        <Input name="email" label={formatMessage({ id: 'Email' })} rule="REQ" />,
        <Input name="nickname" label={formatMessage({ id: 'Nickname' })} />,
        <TextArea name="description" label={formatMessage({ id: 'Description' })} rule="LEN-0-500" />
      ]}
    />
  );
}));

export default UserInfoFormInner;
