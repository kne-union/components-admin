import { createWithRemoteLoader } from '@kne/remote-loader';
import OrgInfo from '../OrgInfo';
import Fetch from '@kne/react-fetch';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import { useNavigate } from 'react-router-dom';

const OrgInner = createWithRemoteLoader({
  modules: [
    'components-core:Layout@Page',
    'components-core:Global@usePreset',
    'components-core:Global@useGlobalContext',
    'components-core:Permissions',
    'components-core:Permissions@usePermissionsPass'
  ]
})(({ remoteModules, menu, pageProps: originPageProps, children }) => {
  const [Page, usePreset, useGlobalContext, Permissions, usePermissionsPass] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis } = usePreset();
  const { global } = useGlobalContext('userInfo');
  const allowCreate = usePermissionsPass({ request: ['setting:org:create'] });
  const allowSave = usePermissionsPass({ request: ['setting:org:edit'] });
  const allowRemove = usePermissionsPass({ request: ['setting:org:remove'] });
  const allowImport = usePermissionsPass({ request: ['setting:org:create'] }) || usePermissionsPass({ request: ['setting:org:edit'] });
  const allowViewUsers = usePermissionsPass({ request: ['setting:user-manager:view'] });
  const navigate = useNavigate();

  const pageProps = Object.assign({}, originPageProps, {
    menu,
    title: formatMessage({ id: 'OrgStructure' }),
    children: (
      <Permissions request={['setting:org:view']} type="error">
        <Fetch
          {...Object.assign({}, apis.tenant.orgList)}
          render={({ data, reload }) => {
            return (
              <OrgInfo
                data={data}
                tenantId={global.tenant?.id}
                companyName={global.tenant?.tenantCompany?.name || global.tenant.name}
                onSuccess={reload}
                onViewUsers={
                  allowViewUsers
                    ? org => {
                        const query = new URLSearchParams({
                          tenantOrgId: String(org.id),
                          orgName: org.name || ''
                        });
                        navigate(`../user?${query.toString()}`);
                      }
                    : undefined
                }
                apis={{
                  create: allowCreate && Object.assign({}, apis.tenant.orgCreate),
                  save: allowSave && Object.assign({}, apis.tenant.orgSave),
                  remove: allowRemove && Object.assign({}, apis.tenant.orgRemove),
                  userList: Object.assign({}, apis.tenant.userList),
                  import: allowImport && Object.assign({}, apis.tenant.orgBatchImport)
                }}
              />
            );
          }}
        />
      </Permissions>
    )
  });

  if (typeof children === 'function') {
    return children(pageProps);
  }

  return <Page {...pageProps} />;
});

export default withLocale(OrgInner);
