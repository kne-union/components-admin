const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const TenantUserSelectMultipleExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { Input } = FormInfo.fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        onSubmit={data => {
          console.log('协作成员:', data);
        }}>
        <FormInfo
          title="跨部门协作"
          column={1}
          list={[<Input name="taskName" label="任务名称" rule="REQ" placeholder="例如：官网改版评审" />]}
        />
        <TenantUserSelect
          name="collaborators"
          label="协作成员"
          rule="REQ"
          single={false}
          companyName="科技创新有限公司"
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <SubmitButton type="primary">保存</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<TenantUserSelectMultipleExample />);
