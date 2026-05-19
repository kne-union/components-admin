const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const TenantUserSelectInitialExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        defaultValues={{
          approver: { id: 'user-2', name: '李娜' }
        }}
        onSubmit={data => {
          console.log('审批人:', data);
        }}>
        <TenantUserSelect
          name="approver"
          label="审批人"
          rule="REQ"
          companyName="科技创新有限公司"
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <SubmitButton type="primary">保存</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<TenantUserSelectInitialExample />);
