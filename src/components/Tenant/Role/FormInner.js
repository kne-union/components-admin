import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules, action, ...props }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Input, TextArea } = FormInfo.fields;
  return (
    <FormInfo
      column={1}
      list={[
        <Input name="name" label={formatMessage({ id: 'RoleName' })} rule="REQ LEN-2-100" />,
        <Input name="code" label={formatMessage({ id: 'RoleCode' })} rule="REQ LEN-2-100" disabled={action === 'edit'} />,
        <TextArea name="description" label={formatMessage({ id: 'RoleDescription' })} />
      ]}
    />
  );
}));

export default FormInner;
