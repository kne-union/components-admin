import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Result, Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import withOidcClient from './withOidcClient';
import withLocale from './withLocale';
import { stripPublicUrl } from '../../utils/publicUrl';
import style from './style.module.scss';

const Callback = withOidcClient(
  withLocale(({ client, onSuccess }) => {
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
          setError(e);
        });
    }, [client, navigate, onSuccess]);

    if (error) {
      return (
        <Result
          status="error"
          title={formatMessage({ id: 'OidcCallbackFailed' })}
          subTitle={error.error_description || error.message}
          extra={
            <Button type="primary" onClick={() => client.login({ returnTo: '/' })}>
              {formatMessage({ id: 'OidcRetryLogin' })}
            </Button>
          }
        />
      );
    }

    return (
      <div className={style['full-loading']}>
        <Spin size="large" tip={formatMessage({ id: 'OidcCallbackLoading' })}>
          <div className={style['full-loading-placeholder']} />
        </Spin>
      </div>
    );
  })
);

export default Callback;
