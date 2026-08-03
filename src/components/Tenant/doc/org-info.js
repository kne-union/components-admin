const { OrgInfo } = _Tenant;
const { default: mockPreset, tenantAdminData } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const Fetch = reactFetch.default;

const tenant = tenantAdminData.tenantDetail;
const tenantId = tenant.id;

const orgApis = {
  create: Object.assign({}, mockPreset.apis.tenantAdmin.orgCreate, {
    data: { tenantId }
  }),
  save: Object.assign({}, mockPreset.apis.tenantAdmin.orgSave, {
    data: { tenantId }
  }),
  remove: Object.assign({}, mockPreset.apis.tenantAdmin.orgRemove, {
    data: { tenantId }
  }),
  userList: Object.assign({}, mockPreset.apis.tenantAdmin.userList, {
    params: { tenantId }
  }),
  orgList: Object.assign({}, mockPreset.apis.tenantAdmin.orgList, {
    params: { tenantId }
  }),
  import: mockPreset.apis.tenantAdmin.orgBatchImport,
  orgLinkConfig: Object.assign({}, mockPreset.apis.tenantAdmin.orgLinkConfig, {
    params: { tenantId }
  }),
  orgLinkSave: Object.assign({}, mockPreset.apis.tenantAdmin.orgLinkSave, {
    data: { tenantId }
  }),
  orgLinkSync: Object.assign({}, mockPreset.apis.tenantAdmin.orgLinkSync, {
    data: { tenantId }
  }),
  orgLinkCancel: Object.assign({}, mockPreset.apis.tenantAdmin.orgLinkCancel, {
    data: { tenantId }
  })
};

const OrgInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Fetch
          {...Object.assign({}, mockPreset.apis.tenantAdmin.orgLinkConfig, {
            params: { tenantId }
          })}
          render={({ data: linkConfigData, reload: reloadLinkConfig }) => {
            const linkedSource = linkConfigData?.enabled ? linkConfigData.source : null;
            const syncSupported = linkConfigData?.syncSupported;
            return (
              <Fetch
                {...Object.assign({}, mockPreset.apis.tenantAdmin.orgList, {
                  params: { tenantId }
                })}
                render={({ data, reload }) => (
                  <OrgInfo
                    data={data}
                    tenantId={tenantId}
                    companyName={tenant?.tenantCompany?.name}
                    onSuccess={reload}
                    linkedSource={linkedSource}
                    linkSettingProps={
                      syncSupported
                        ? {
                            tenantId,
                            envArgs: tenant.tenantSetting?.args || [],
                            onLinkChange: reloadLinkConfig
                          }
                        : null
                    }
                    apis={orgApis}
                  />
                )}
              />
            );
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<OrgInfoExample />);
