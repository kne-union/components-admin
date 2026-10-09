import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import BizUnit from '@components/BizUnit';
import withLocale from '../withLocale';
import Menu from '../Menu';
import getColumns from './getColumns';
import FormInner from './FormInner';

const pickPayload = formData => ({
  name: formData.name,
  scope: formData.scope || '',
  accessTokenTTL: formData.accessTokenTTL || undefined,
  includePermissions: !!formData.includePermissions,
  description: formData.description || ''
});

const ResourceServerManager = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset] = remoteModules;
    const { apis: presetApis } = usePreset();
    const { formatMessage } = useIntl();
    const apis = presetApis.oidc.resourceServer;

    return (
      <BizUnit
        isNext
        name="oidc-resource-server-list"
        page={{
          title: formatMessage({ id: 'ResourceServerManager' }),
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
        apis={{
          list: apis.list,
          create: ({ formData }) => Object.assign({}, apis.create, { data: Object.assign(pickPayload(formData), { identifier: formData.identifier }) }),
          save: ({ formData, data }) => Object.assign({}, apis.save, { data: Object.assign(pickPayload(formData), { id: data.id }) }),
          remove: apis.remove,
          setStatus: apis.setStatus
        }}
        getColumns={() => getColumns({ formatMessage })}
        getFormInner={({ action }) => <FormInner action={action} />}
        options={{
          bizName: formatMessage({ id: 'ResourceServer' }),
          keywordFilterName: 'keyword',
          keywordFilterLabel: formatMessage({ id: 'Keyword' })
        }}
      />
    );
  })
);

export default ResourceServerManager;
