import { useEffect } from 'react';
import { Flex, Spin } from 'antd';
import { removeToken } from '@kne/token-storage';
import LoginOuterContainer from '../LoginOuterContainer';
import DoLogin from './DoLogin';
import { useProps } from './context';
import LoginComponent from '../Login';
import Language from '../Language';
import { SsoButton, SsoRedirect } from './SsoLogin';
import style from './style.module.scss';

const Login = () => {
  const { loginTitle, systemName, systemLogo, loginLeftInner, registerUrl, forgetUrl, accountType, afterLogin, allowLanguageSwitch, storeKeys, domain, targetUrl, sso } =
    useProps();
  useEffect(() => {
    Object.values(storeKeys || { token: 'X-User-Token' }).forEach(tokenKey => {
      removeToken(tokenKey, domain);
    });
    // 只在进入登录页时清一次。storeKeys 由 Account merge 每次 render 新建，列入依赖会在登录成功写入 token 后被再次清掉。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderInner = () => {
    if (sso?.loading) {
      return (
        <Flex className={style['sso-redirect']} align="center" justify="center">
          <Spin size="large" />
        </Flex>
      );
    }
    // 非 standalone（central 子项目）账号由主项目管理，直接跳转主项目 IdP
    if (sso?.enabled && sso.mode !== 'standalone') {
      return <SsoRedirect client={sso.client} targetUrl={targetUrl} />;
    }
    return (
      <>
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
        {sso?.enabled && <SsoButton client={sso.client} targetUrl={targetUrl} />}
      </>
    );
  };

  return (
    <LoginOuterContainer title={systemName} logo={systemLogo} leftInner={loginLeftInner}>
      {renderInner()}
      {allowLanguageSwitch && <Language colorful={false} className={style['language']} />}
    </LoginOuterContainer>
  );
};

export default Login;
