const {ResetPassword} = _Account;
const {Flex} = antd;
const BaseExample = () => {
    return <Flex vertical gap={8}>
        <ResetPassword account="test@test.com"/>
        <ResetPassword type="phone" account="+81 17029292828"/>
    </Flex>;
};

render(<BaseExample/>);
