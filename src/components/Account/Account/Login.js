import LoginOuterContainer from '../LoginOuterContainer';
import DoLogin from './DoLogin';
import { useProps } from './context';
import LoginComponent from '../Login';

const Login = () => {
  const { loginTitle, registerUrl, forgetUrl, accountType, afterLogin } = useProps();
  return (
    <LoginOuterContainer>
      <DoLogin>
        {({ login }) => {
          return (
            <LoginComponent
              title={loginTitle}
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
