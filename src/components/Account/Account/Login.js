import LoginOuterContainer from '../LoginOuterContainer';
import DoLogin from './DoLogin';
import { useProps } from './context';
import LoginComponent from '../Login';

const Login = () => {
  const { loginTitle, systemName, systemLogo, loginLeftInner, registerUrl, forgetUrl, accountType, afterLogin } = useProps();
  return (
    <LoginOuterContainer title={systemName} logo={systemLogo} leftInner={loginLeftInner}>
      <DoLogin>
        {({ login }) => {
          return (
            <LoginComponent
              title={loginTitle}
              systemName={systemName}
              registerUrl={registerUrl}
              forgetUrl={forgetUrl}
              afterLogin={afterLogin}
              onSubmit={async formData => {
                await login(Object.assign({}, formData, { type: accountType }));
              }}
            />
          );
        }}
      </DoLogin>
    </LoginOuterContainer>
  );
};

export default Login;
