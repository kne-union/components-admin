const { Compose, AccountSelectField, LabelSelectField } = _MailGateway;
const { default: mockPreset, mailGatewayData } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Flex, Typography, App } = antd;

const customerMail = mailGatewayData.mails.find(item => item.folder === 'inbox');
const draftMail = mailGatewayData.mails.find(item => item.folder === 'draft');
const serviceAccount = mailGatewayData.accounts.find(item => item.id === customerMail.accountId);

const ComposeDemo = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton } = FormInfo;
  const { message } = App.useApp();
  const onSuccess = () => message.info('邮件已提交到网关，可在“已发送 / 草稿箱”查看');
  return (
    <Flex vertical gap={24}>
      <Flex vertical gap={8}>
        <Typography.Text strong>写信 / 回复 / 转发 / 编辑草稿</Typography.Text>
        <Typography.Text type="secondary">{`原邮件：${customerMail.subject}`}</Typography.Text>
        <Flex gap={8} wrap>
          <Compose type="primary" accountId={serviceAccount.id} onSuccess={onSuccess} />
          <Compose mode="reply" mail={customerMail} accountId={serviceAccount.id} accountAddress={serviceAccount.address} onSuccess={onSuccess}>
            回复客户
          </Compose>
          <Compose mode="replyAll" mail={customerMail} accountId={serviceAccount.id} accountAddress={serviceAccount.address} onSuccess={onSuccess}>
            回复全部
          </Compose>
          <Compose mode="forward" mail={customerMail} accountId={serviceAccount.id} onSuccess={onSuccess}>
            转发给同事
          </Compose>
          <Compose mode="draft" mail={draftMail} onSuccess={onSuccess}>
            继续编辑草稿
          </Compose>
        </Flex>
      </Flex>
      <Flex vertical gap={8}>
        <Typography.Text strong>邮箱 / 标签选择字段</Typography.Text>
        <Form onSubmit={data => message.success(JSON.stringify(data))}>
          <FormInfo
            column={1}
            list={[
              <AccountSelectField name="accountId" label="邮箱" rule="REQ" onlyEnabled />,
              <LabelSelectField name="labelIds" label="标签" accountId={serviceAccount.id} />
            ]}
          />
          <SubmitButton>提交</SubmitButton>
        </Form>
      </Flex>
    </Flex>
  );
});

const ComposeExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <ComposeDemo />
    </PureGlobal>
  );
});

render(<ComposeExample />);
