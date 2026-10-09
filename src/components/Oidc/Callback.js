import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import LoginIllustration from '@components/LoginIllustration';
import LoginOuterContainer from '../Account/LoginOuterContainer';
import { Layout } from '../Account/Account';
import { CancelledIcon, ExpiredIcon, FailedIcon } from './CallbackIcons';
import ResultPanel from './ResultPanel';
import withOidcClient from './withOidcClient';
import withLocale from './withLocale';
import { stripPublicUrl } from '../../utils/publicUrl';
import style from './style.module.scss';

const defaultLeftInner = <LoginIllustration type="workforce" />;

const Callback = withOidcClient(
  withLocale(({ client, onSuccess, systemName, systemLogo, loginLeftInner = defaultLeftInner }) => {
    const { formatMessage } = useIntl();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    // 授权码只能兑换一次，StrictMode 下 effect 会执行两次
    const handledRef = useRef(false);

    useEffect(() => {
      if (handledRef.current) {
        return;
      }
      handledRef.current = true;
      client
        .handleCallback()
        .then(result => {
          if (!result) {
            return;
          }
          if (onSuccess) {
            onSuccess(result);
            return;
          }
          navigate(stripPublicUrl(result.returnTo), { replace: true });
        })
        .catch(e => {
          // 登录成功后刷新回调页：临时状态已用掉，但令牌仍有效
          if (e.error === 'login_state_expired' && client.isAuthenticated()) {
            navigate('/', { replace: true });
            return;
          }
          console.error(e);
          setError(e);
        });
    }, [client, navigate, onSuccess]);

    // 用户在交互页点「取消登录」时 IdP 返回 access_denied，不属于异常
    const cancelled = error?.error === 'access_denied';
    const expired = error?.error === 'login_state_expired';
    // 报错原文多为英文技术信息，只按错误类型展示本地化文案
    const messageIds = {
      access_denied: ['OidcLoginCancelled', 'OidcLoginCancelledDesc'],
      login_state_expired: ['OidcLoginExpired', 'OidcLoginExpiredDesc']
    }[error?.error] || ['OidcCallbackFailed', 'OidcCallbackFailedDesc'];

    return (
      <Layout>
        <LoginOuterContainer title={systemName} logo={systemLogo} leftInner={loginLeftInner}>
          {error ? (
            <ResultPanel
              icon={cancelled ? <CancelledIcon /> : expired ? <ExpiredIcon /> : <FailedIcon />}
              danger={!cancelled && !expired}
              title={formatMessage({ id: messageIds[0] })}
              description={formatMessage({ id: messageIds[1] })}
              actionText={formatMessage({ id: 'OidcRetryLogin' })}
              onAction={() => client.login({ returnTo: '/' })}
            />
          ) : (
            <div className={style['callback-loading']}>
              <Spin size="large" tip={formatMessage({ id: 'OidcCallbackLoading' })}>
                <div className={style['full-loading-placeholder']} />
              </Spin>
            </div>
          )}
        </LoginOuterContainer>
      </Layout>
    );
  })
);

export default Callback;
