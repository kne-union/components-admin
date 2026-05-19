const { OrgInfo } = _Tenant;
const { default: mockPreset, tenantAdminData } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const Fetch = reactFetch.default;

const OrgInfoInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const tenant = tenantAdminData.tenantDetail;
  return (
    <Fetch
      {...Object.assign({}, apis.tenantAdmin.orgList, {
        params: {
          tenantId: tenant.id
        }
      })}
      render={({ data, reload }) => {
        return (
          <OrgInfo
            data={data}
            tenantId={tenant.id}
            companyName={tenant?.tenantCompany?.name}
            onSuccess={reload}
            apis={{
              create: Object.assign({}, apis.tenantAdmin.orgCreate, {
                data: { tenantId: tenant.id }
              }),
              save: Object.assign({}, apis.tenantAdmin.orgSave, {
                data: { tenantId: tenant.id }
              }),
              remove: Object.assign({}, apis.tenantAdmin.orgRemove, {
                data: { tenantId: tenant.id }
              }),
              userList: Object.assign({}, apis.tenantAdmin.userList, {
                params: { tenantId: tenant.id }
              }),
              import: apis.tenantAdmin.orgBatchImport
            }}
          />
        );
      }}
    />
  );
});

const OrgInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <OrgInfoInner />
      </Layout>
    </PureGlobal>
  );
});

render(<OrgInfoExample />);
