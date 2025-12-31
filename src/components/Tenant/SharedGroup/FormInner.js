import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(withLocale(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Input } = FormInfo.fields;

  return <FormInfo column={1} list={[<Input name="name" label={formatMessage({ id: 'SharedGroupName' })} rule="REQ LEN-2-100" />]} />;
}));

export default FormInner;
