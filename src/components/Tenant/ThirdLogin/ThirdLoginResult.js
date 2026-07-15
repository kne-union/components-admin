import { useEffect } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useSearchParams } from 'react-router-dom';
import Fetch from '@kne/react-fetch';
import { setToken } from '@kne/token-storage';
import { Spin, Typography } from 'antd';
import withLocale from '../withLocale';
import { usePlatformShell, ThirdLoginLoading, ThirdLoginError, ThirdLoginPanel } from './shared';
import style from './style.module.scss';

const nameInitial = name => {
  const text = String(name || '').trim();
  return text ? text.charAt(0).toUpperCase() : '?';
};

const ThirdLoginResultContent = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, data }) => {
  const [Image] = remoteModules;
  const platform = data?.platform;
  const { formatMessage, title, logo } = usePlatformShell(platform);
  const token = data?.token;
  const redirectUrl = data?.redirectUrl;

  useEffect(() => {
    if (!token) {
      return;
    }
    setToken('X-Third-Login-Token', token);
    if (redirectUrl) {
      window.location.href = decodeURIComponent(redirectUrl);
    }
  }, [token, redirectUrl]);

  if (!token) {
    return (
      <ThirdLoginError
        title={title}
        logo={logo}
        message={formatMessage({ id: 'ThirdLoginAuthFailed' })}
        tip={formatMessage({ id: 'ContactAdmin' })}
      />
    );
  }

  return (
    <ThirdLoginPanel title={title} logo={logo}>
      <div className={style.brand}>
        {data?.avatar ? (
          <span className={style.logoWrap}>
            <Image.Avatar id={data.avatar} size={72} alt={data.name} />
          </span>
        ) : (
          <span className={style.logoFallback} aria-hidden>
            {nameInitial(data?.name)}
          </span>
        )}
        {data?.name ? (
          <Typography.Title level={3} className={style.companyName}>
            {data.name}
          </Typography.Title>
        ) : null}
        {(data?.email || data?.phone) && (
          <div className={style.userMeta}>
            {data.email ? <p className={style.userMetaItem}>{data.email}</p> : null}
            {data.phone ? <p className={style.userMetaItem}>{data.phone}</p> : null}
          </div>
        )}
      </div>
      <div className={style.status}>
        {redirectUrl ? (
          <>
            <Spin size="large" />
            <p className={style.statusTip}>{formatMessage({ id: 'ThirdLoginAuthSuccess' })}</p>
          </>
        ) : (
          <p className={style.statusTip}>{formatMessage({ id: 'ThirdLoginAuthSuccess' })}</p>
        )}
      </div>
    </ThirdLoginPanel>
  );
});

const ThirdLoginResult = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const [searchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  // code / message 由第三方回跳携带，不参与业务接口请求
  const { code: _code, message: _message, ...others } = params;
  const platform = searchParams.get('platform');
  const { formatMessage, title, logo } = usePlatformShell(platform);

  if (!others.tenantId) {
    return (
      <ThirdLoginError
        title={title}
        logo={logo}
        message={formatMessage({ id: 'ThirdLoginParamsMissing' })}
        tip={formatMessage({ id: 'ContactAdmin' })}
      />
    );
  }

  return (
    <Fetch
      {...Object.assign({}, apis.tenant.thirdLoginResult, {
        data: Object.assign({}, others)
      })}
      loading={<ThirdLoginLoading title={title} logo={logo} tip={formatMessage({ id: 'ThirdLoginResultProcessing' })} />}
      error={error => (
        <ThirdLoginError
          title={title}
          logo={logo}
          message={error || formatMessage({ id: 'ThirdLoginAuthFailed' })}
          tip={formatMessage({ id: 'ContactAdmin' })}
        />
      )}
      render={({ data }) => <ThirdLoginResultContent data={data} />}
    />
  );
});

export default withLocale(ThirdLoginResult);
