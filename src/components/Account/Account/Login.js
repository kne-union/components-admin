import { useEffect } from 'react';
import { removeToken } from '@kne/token-storage';
import LoginOuterContainer from '../LoginOuterContainer';
import DoLogin from './DoLogin';
import { useProps } from './context';
import LoginComponent from '../Login';
import Language from '../Language';
import style from './style.module.scss';

const Login = () => {
  const { loginTitle, systemName, systemLogo, loginLeftInner, registerUrl, forgetUrl, accountType, afterLogin, allowLanguageSwitch, storeKeys, domain } = useProps();
  useEffect(() => {
    Object.values(storeKeys || { token: 'X-User-Token' }).forEach(tokenKey => {
      removeToken(tokenKey, domain);
    });
  }, [storeKeys, domain]);
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
      {allowLanguageSwitch && <Language colorful={false} className={style['language']} />}
    </LoginOuterContainer>
  );
};

export default Login;
