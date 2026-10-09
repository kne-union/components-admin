import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { GRANT_TYPES } from './utils';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, action }) => {
    const [FormInfo, usePreset] = remoteModules;
    const { apis } = usePreset();
    const { Input, TextArea, RadioGroup, CheckboxGroup } = FormInfo.fields;
    const { formatMessage } = useIntl();

    return (
      <Fetch
        {...Object.assign({}, apis.oidc.resourceServer.list, { params: { perPage: 100, currentPage: 1 } })}
        render={({ data }) => (
          <FormInfo
            column={1}
            list={[
              action === 'create' && <Input name="clientId" label={formatMessage({ id: 'ClientId' })} placeholder={formatMessage({ id: 'ClientIdPlaceholder' })} rule="LEN-0-100" />,
              <Input name="clientName" label={formatMessage({ id: 'ClientName' })} rule="REQ LEN-1-100" />,
              <RadioGroup
                name="clientType"
                label={formatMessage({ id: 'ClientType' })}
                rule="REQ"
                defaultValue="public"
                options={[
                  { label: formatMessage({ id: 'ClientTypePublic' }), value: 'public' },
                  { label: formatMessage({ id: 'ClientTypeConfidential' }), value: 'confidential' }
                ]}
              />,
              <CheckboxGroup
                name="grantTypes"
                label={formatMessage({ id: 'GrantTypes' })}
                rule="REQ"
                defaultValue={[GRANT_TYPES.authorizationCode, GRANT_TYPES.refreshToken]}
                options={[
                  { label: formatMessage({ id: 'GrantAuthorizationCode' }), value: GRANT_TYPES.authorizationCode },
                  { label: formatMessage({ id: 'GrantRefreshToken' }), value: GRANT_TYPES.refreshToken },
                  { label: formatMessage({ id: 'GrantClientCredentials' }), value: GRANT_TYPES.clientCredentials },
                  { label: formatMessage({ id: 'GrantTokenExchange' }), value: GRANT_TYPES.tokenExchange }
                ]}
              />,
              <TextArea name="redirectUris" label={formatMessage({ id: 'RedirectUris' })} placeholder={formatMessage({ id: 'UrisPlaceholder' })} rule="LEN-0-2000" />,
              <TextArea
                name="postLogoutRedirectUris"
                label={formatMessage({ id: 'PostLogoutRedirectUris' })}
                placeholder={formatMessage({ id: 'UrisPlaceholder' })}
                rule="LEN-0-2000"
              />,
              <Input name="backchannelLogoutUri" label={formatMessage({ id: 'BackchannelLogoutUri' })} rule="LEN-0-500" />,
              <CheckboxGroup
                name="allowedResources"
                label={formatMessage({ id: 'AllowedResources' })}
                options={(data?.pageData || []).map(item => ({ label: `${item.name || item.identifier} (${item.identifier})`, value: item.identifier }))}
              />,
              <TextArea name="description" label={formatMessage({ id: 'Description' })} rule="LEN-0-500" />
            ].filter(Boolean)}
          />
        )}
      />
    );
  })
);

export default FormInner;
