import { useEffect } from 'react';
import Fetch from '@kne/react-fetch';
import { useSearchParams } from 'react-router-dom';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { Spin, Typography } from 'antd';
import withLocale from '../withLocale';
import { usePlatformShell, ThirdLoginLoading, ThirdLoginError, ThirdLoginPanel } from './shared';
import style from './style.module.scss';

const companyInitial = name => {
  const text = String(name || '').trim();
  return text ? text.charAt(0).toUpperCase() : '?';
};

const ThirdLoginContent = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, data, platform }) => {
  const [Image] = remoteModules;
  const { formatMessage, title, logo } = usePlatformShell(platform);
  const redirectUrl = data?.redirectUrl;

  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  return (
    <ThirdLoginPanel title={title} logo={logo}>
      <div className={style.brand}>
        {data?.logo ? (
          <span className={style.logoWrap}>
            <Image.Avatar id={data.logo} size={72} alt={data.companyName} />
          </span>
        ) : (
          <span className={style.logoFallback} aria-hidden>
            {companyInitial(data?.companyName)}
          </span>
        )}
        {data?.companyName ? (
          <Typography.Title level={3} className={style.companyName}>
            {data.companyName}
          </Typography.Title>
        ) : null}
        <Typography.Paragraph className={style.subtitle}>{formatMessage({ id: 'ThirdLoginSubtitle' })}</Typography.Paragraph>
      </div>
      <div className={style.status}>
        {redirectUrl ? (
          <>
            <Spin size="large" />
            <p className={style.statusTip}>{formatMessage({ id: 'ThirdLoginAuthenticating' })}</p>
          </>
        ) : null}
      </div>
    </ThirdLoginPanel>
  );
});

const ThirdLogin = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [usePreset] = remoteModules;
  const { apis } = usePreset();
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform');
  const tenantId = searchParams.get('tenantId');
  const { formatMessage, title, logo } = usePlatformShell(platform);

  if (!platform || !tenantId) {
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
      {...Object.assign({}, apis.tenant.thirdLogin, {
        data: { platform, tenantId }
      })}
      loading={<ThirdLoginLoading title={title} logo={logo} tip={formatMessage({ id: 'FetchingTenantInfo' })} />}
      error={error => (
        <ThirdLoginError
          title={title}
          logo={logo}
          message={error || formatMessage({ id: 'ThirdLoginAuthFailed' })}
          tip={formatMessage({ id: 'ContactAdmin' })}
        />
      )}
      render={({ data }) => <ThirdLoginContent data={data} platform={platform} />}
    />
  );
});

export default withLocale(ThirdLogin);
