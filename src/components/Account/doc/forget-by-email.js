const {LoginOuterContainer, ForgetByEmail} = _Account;
const BaseExample = () => {
    return <LoginOuterContainer>
        <ForgetByEmail onSubmit={(data, callback) => {
            callback();
        }}/>
    </LoginOuterContainer>;
};

render(<BaseExample/>);
