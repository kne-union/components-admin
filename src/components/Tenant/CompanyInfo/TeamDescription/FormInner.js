import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import style from '../style.module.scss';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();

  const { List } = FormInfo;
  const { Avatar, Input, TextArea } = FormInfo.fields;

  return (
    <List
      className={style['form-section']}
      name="teamDescription"
      list={[
        <Avatar name="avatar" label={formatMessage({ id: 'TeamAvatar' })} interceptor="photo-string" block />,
        <Input name="name" label={formatMessage({ id: 'TeamName' })} rule="REQ LEN-0-100" />,
        <Input name="role" label={formatMessage({ id: 'TeamRole' })} rule="REQ LEN-0-100" />,
        <TextArea name="description" label={formatMessage({ id: 'TeamIntroduction' })} rule="LEN-0-500" block />
      ]}
    />
  );
}));

export default FormInner;
