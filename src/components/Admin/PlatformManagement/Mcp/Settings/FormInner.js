import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../../withLocale';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { Input, TextArea, Switch } = FormInfo.fields;
    const { formatMessage } = useIntl();

    return (
      <FormInfo
        column={1}
        list={[
          <Input name="method" label={formatMessage({ id: 'McpMethod' })} disabled />,
          <Input name="path" label={formatMessage({ id: 'McpPath' })} disabled />,
          <Input name="summary" label={formatMessage({ id: 'McpSummary' })} disabled />,
          <TextArea
            name="scenariosText"
            label={formatMessage({ id: 'McpScenarios' })}
            placeholder={formatMessage({ id: 'McpScenariosPlaceholder' })}
          />,
          <Switch name="confirm" label={formatMessage({ id: 'McpConfirm' })} />
        ]}
      />
    );
  })
);

export default FormInner;
