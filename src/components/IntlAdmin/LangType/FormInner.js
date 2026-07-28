import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules, action }) => {
    const [FormInfo] = remoteModules;
    const { formatMessage } = useIntl();
    const { Input, TextArea } = FormInfo.fields;

    return (
      <FormInfo
        column={1}
        list={[
          <Input name="name" label={formatMessage({ id: 'LangTypeName' })} rule="REQ LEN-0-100" />,
          <Input name="code" label={formatMessage({ id: 'Code' })} rule="REQ LEN-0-100" disabled={action === 'edit'} />,
          <TextArea name="params" label={formatMessage({ id: 'Params' })} rule="LEN-0-1000" />,
          <TextArea name="description" label={formatMessage({ id: 'Description' })} rule="LEN-0-1000" />
        ]}
      />
    );
  })
);

export default FormInner;
