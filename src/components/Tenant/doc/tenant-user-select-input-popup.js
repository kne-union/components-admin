const { TenantUserSelect } = _Tenant;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const TenantUserSelectInputPopupExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [FormInfo, PureGlobal] = remoteModules;
  const { Form, SubmitButton, CancelButton } = FormInfo;
  const { Input } = FormInfo.fields;

  return (
    <PureGlobal preset={mockPreset}>
      <Form
        onSubmit={data => {
          console.log('提交数据:', data);
        }}>
        <FormInfo
          title="下拉选择负责人（SelectInput isPopup）"
          column={1}
          list={[<Input name="projectName" label="项目名称" rule="REQ" placeholder="例如：Q2 产品迭代" />]}
        />
        <TenantUserSelect.Input
          name="owner"
          label="项目负责人"
          rule="REQ"
          isPopup
          companyName="科技创新有限公司"
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <CancelButton style={{ marginRight: 8 }}>取消</CancelButton>
          <SubmitButton type="primary">提交</SubmitButton>
        </div>
      </Form>
    </PureGlobal>
  );
});

render(<TenantUserSelectInputPopupExample />);
