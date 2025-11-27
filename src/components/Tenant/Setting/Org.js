import { createWithRemoteLoader } from '@kne/remote-loader';
import OrgInfo from '../OrgInfo';
import Fetch from '@kne/react-fetch';

const Org = createWithRemoteLoader({
  modules: ['components-core:Layout@Page', 'components-core:Global@usePreset', 'components-core:Global@useGlobalContext']
})(({ remoteModules, menu }) => {
  const [Page, usePreset, useGlobalContext] = remoteModules;
  const { apis } = usePreset();
  const { global } = useGlobalContext('userInfo');
  return (
    <Page title="组织架构" menu={menu}>
      <Fetch
        {...Object.assign({}, apis.tenant.orgList)}
        render={({ data, reload }) => {
          return (
            <OrgInfo
              data={data}
              companyName={global.tenant?.tenantCompany?.name || global.tenant.name}
              onSuccess={reload}
              apis={{
                create: Object.assign({}, apis.tenant.orgCreate),
                save: Object.assign({}, apis.tenant.orgSave),
                remove: Object.assign({}, apis.tenant.orgRemove)
              }}
            />
          );
        }}
      />
    </Page>
  );
});

export default Org;
