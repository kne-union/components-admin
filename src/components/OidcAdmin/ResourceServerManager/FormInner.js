import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules, action }) => {
    const [FormInfo] = remoteModules;
    const { Input, InputNumber, TextArea, Switch } = FormInfo.fields;
    const { formatMessage } = useIntl();

    return (
      <FormInfo
        column={1}
        list={[
          <Input
            name="identifier"
            label={formatMessage({ id: 'Identifier' })}
            placeholder={formatMessage({ id: 'IdentifierPlaceholder' })}
            rule="REQ LEN-1-255"
            disabled={action === 'edit'}
          />,
          <Input name="name" label={formatMessage({ id: 'ResourceServerName' })} rule="REQ LEN-1-100" />,
          <Input name="scope" label={formatMessage({ id: 'Scope' })} placeholder={formatMessage({ id: 'ScopePlaceholder' })} rule="LEN-0-500" />,
          <InputNumber
            name="accessTokenTTL"
            label={formatMessage({ id: 'AccessTokenTTL' })}
            placeholder={formatMessage({ id: 'AccessTokenTTLPlaceholder' })}
            min={60}
            max={86400}
          />,
          <Switch name="includePermissions" label={formatMessage({ id: 'IncludePermissions' })} />,
          <TextArea name="description" label={formatMessage({ id: 'Description' })} rule="LEN-0-500" />
        ]}
      />
    );
  })
);

export default FormInner;
