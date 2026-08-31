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
    // 只在进入登录页时清一次。storeKeys 由 Account merge 每次 render 新建，列入依赖会在登录成功写入 token 后被再次清掉。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
