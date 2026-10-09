import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import withOidcClient from './withOidcClient';
import withLocale from './withLocale';
import style from './style.module.scss';

const OidcAuthenticate = withOidcClient(
  withLocale(({ client, loginParams, children }) => {
    const { formatMessage } = useIntl();
    const [authenticated, setAuthenticated] = useState(() => client.isAuthenticated());

    useEffect(
      () =>
        client.subscribe(() => {
          setAuthenticated(client.isAuthenticated());
        }),
      [client]
    );

    useEffect(() => {
      if (!authenticated) {
        client.login(loginParams);
      }
      // loginParams 通常是内联对象，只在登录态变化时触发跳转
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authenticated, client]);

    if (!authenticated) {
      return (
        <div className={style['full-loading']}>
          <Spin size="large" tip={formatMessage({ id: 'OidcRedirecting' })}>
            <div className={style['full-loading-placeholder']} />
          </Spin>
        </div>
      );
    }

    return typeof children === 'function' ? children({ client }) : children;
  })
);

export default OidcAuthenticate;
