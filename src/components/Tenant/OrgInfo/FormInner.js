import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Input, TextArea } = FormInfo.fields;
  return (
    <FormInfo
      column={1}
      list={[<Input name="name" label={formatMessage({ id: 'OrgName' })} rule="REQ LEN-0-100" />, <TextArea name="description" label={formatMessage({ id: 'OrgDescription' })} rule="LEN-0-500" />]}
    />
  );
}));

export default FormInner;
