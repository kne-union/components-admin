const { Modify } = _Account;
const { Flex, message } = antd;

const BaseExample = () => {
  return (
    <Flex vertical gap={20}>
      <Modify
        type="email"
        account="zhangsan@company.com"
        onSubmit={formData => {
          console.log('修改密码:', formData);
          message.success('密码修改成功');
        }}
      />
      <Modify
        type="phone"
        account="+86 13800138000"
        onSubmit={formData => {
          console.log('修改密码:', formData);
          message.success('密码修改成功');
        }}
      />
    </Flex>
  );
};

render(<BaseExample />);
