import { useEffect, useRef, useState } from 'react';
import { Button, Divider, Flex, Result, Spin, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { stripPublicUrl, withPublicUrl } from '../../../utils/publicUrl';
import style from './style.module.scss';

// 登录页 ?referer= 转为 IdP 回调后要回到的地址（client.login 的 returnTo 需带 publicUrl 前缀）
const useReturnTo = targetUrl => {
  const [searchParams] = useSearchParams();
  const fallback = targetUrl || '/';
  const referer = searchParams.get('referer');
  if (!referer) {
    return withPublicUrl(fallback);
  }
  const decoded = decodeURIComponent(referer);
  const url = new URL(/http(s)?:/.test(decoded) ? decoded : window.location.origin + decoded);
  url.searchParams.delete('referer');
  if (/\/account\/login\/?$/.test(url.pathname)) {
    return withPublicUrl(fallback);
  }
  return withPublicUrl(stripPublicUrl(url.pathname)) + url.search;
};

export const SsoButton = withLocale(({ client, targetUrl }) => {
  const { formatMessage } = useIntl();
  const returnTo = useReturnTo(targetUrl);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Divider plain>{formatMessage({ id: 'Or' })}</Divider>
      <Button
        block
        size="large"
        loading={loading}
        onClick={async () => {
          setLoading(true);
          try {
            await client.login({ returnTo });
          } finally {
            setLoading(false);
          }
        }}>
        {formatMessage({ id: 'SsoLogin' })}
      </Button>
    </>
  );
});

export const SsoRedirect = withLocale(({ client, targetUrl }) => {
  const { formatMessage } = useIntl();
  const returnTo = useReturnTo(targetUrl);
  const [error, setError] = useState(null);
  const startedRef = useRef(false);

  const start = () => {
    setError(null);
    Promise.resolve()
      .then(() => client.login({ returnTo }))
      .catch(setError);
  };

  useEffect(() => {
    // StrictMode 下 effect 会执行两次，避免重复发起授权请求
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <Result
        status="error"
        title={formatMessage({ id: 'SsoRedirectFailed' })}
        subTitle={error.message}
        extra={
          <Button type="primary" onClick={start}>
            {formatMessage({ id: 'Retry' })}
          </Button>
        }
      />
    );
  }

  return (
    <Flex className={style['sso-redirect']} vertical align="center" justify="center" gap={16}>
      <Spin size="large" />
      <Typography.Text type="secondary">{formatMessage({ id: 'SsoRedirecting' })}</Typography.Text>
    </Flex>
  );
});
