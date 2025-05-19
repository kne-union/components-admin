const {Modify} = _Account;
const {Flex} = antd;
const BaseExample = () => {
    return <Flex vertical gap={8}>
        <Modify account="test@test.com"/>
        <Modify type="phone" account="+81 17029292828"/>
    </Flex>;
};

render(<BaseExample/>);
