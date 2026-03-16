const { OrgInfo } = _Tenant;
const { default: mockPreset, tenantData } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const OrgInfoExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <OrgInfo
          data={tenantData.orgList}
          companyName={tenantData.company.name}
          apis={{
            create: { loader: () => ({ id: `dept-${Date.now()}` }) },
            save: { loader: () => ({ code: 0 }) },
            remove: { loader: () => ({ code: 0 }) }
          }}
          onSuccess={() => {
            console.log('操作成功');
          }}
        />
      </Layout>
    </PureGlobal>
  );
});

render(<OrgInfoExample />);
