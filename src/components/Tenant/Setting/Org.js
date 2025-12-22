import { createWithRemoteLoader } from '@kne/remote-loader';
import OrgInfo from '../OrgInfo';
import Fetch from '@kne/react-fetch';

const Org = createWithRemoteLoader({
  modules: [
    'components-core:Layout@Page',
    'components-core:Global@usePreset',
    'components-core:Global@useGlobalContext',
    'components-core:Permissions',
    'components-core:Permissions@usePermissionsPass'
  ]
})(({ remoteModules, menu, children }) => {
  const [Page, usePreset, useGlobalContext, Permissions, usePermissionsPass] = remoteModules;
  const { apis } = usePreset();
  const { global } = useGlobalContext('userInfo');
  const allowCreate = usePermissionsPass({ request: ['setting:org:create'] });
  const allowSave = usePermissionsPass({ request: ['setting:org:edit'] });
  const allowRemove = usePermissionsPass({ request: ['setting:org:remove'] });

  const pageProps = {
    menu,
    title: '组织架构',
    children: (
      <Permissions request={['setting:org:view']} type="error">
        <Fetch
          {...Object.assign({}, apis.tenant.orgList)}
          render={({ data, reload }) => {
            return (
              <OrgInfo
                data={data}
                companyName={global.tenant?.tenantCompany?.name || global.tenant.name}
                onSuccess={reload}
                apis={{
                  create: allowCreate && Object.assign({}, apis.tenant.orgCreate),
                  save: allowSave && Object.assign({}, apis.tenant.orgSave),
                  remove: allowRemove && Object.assign({}, apis.tenant.orgRemove)
                }}
              />
            );
          }}
        />
      </Permissions>
    )
  };

  if (typeof children === 'function') {
    return children(pageProps);
  }

  return <Page {...pageProps} />;
});

export default Org;
