import { createWithRemoteLoader } from '@kne/remote-loader';
import { useEffect, useState } from 'react';
import useRefCallback from '@kne/use-ref-callback';
import { useNavigate } from 'react-router-dom';
import { App, Button, Flex, Spin } from 'antd';
import { CheckCircleFilled, ExclamationCircleFilled, ReloadOutlined, SafetyCertificateFilled } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import classnames from 'classnames';
import withLocale from './withLocale';
import style from './style.module.scss';

const InitAdminInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, baseUrl = '/admin' }) => {
  const [usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending'); // pending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const initAdmin = useRefCallback(async () => {
    setStatus('pending');
    setErrorMsg('');
    try {
      const { data: resData } = await ajax(Object.assign({}, apis.admin.initSuperAdmin));
      if (resData.code !== 0) {
        setStatus('error');
        setErrorMsg(resData.msg || formatMessage({ id: 'InitSystemFailed' }));
        return;
      }
      setStatus('success');
      message.success(formatMessage({ id: 'InitSuccess' }));
      window.setTimeout(() => {
        navigate(baseUrl, { replace: true });
      }, 800);
    } catch (e) {
      setStatus('error');
      setErrorMsg(e?.message || formatMessage({ id: 'InitSystemFailed' }));
    }
  });

  useEffect(() => {
    initAdmin();
  }, [initAdmin]);

  const hints = [
    formatMessage({ id: 'InitSystemHintOnce' }),
    formatMessage({ id: 'InitSystemHintUser' }),
    formatMessage({ id: 'InitSystemHintNext' })
  ];

  return (
    <div className={style['init-page']}>
      <div className={style['init-card']}>
        <div
          className={classnames(style['init-icon'], {
            [style['is-success']]: status === 'success',
            [style['is-error']]: status === 'error'
          })}
        >
          {status === 'success' ? <CheckCircleFilled /> : status === 'error' ? <ExclamationCircleFilled /> : <SafetyCertificateFilled />}
        </div>
        <h1 className={style['init-title']}>{formatMessage({ id: 'InitSystem' })}</h1>
        <p className={style['init-desc']}>{formatMessage({ id: 'InitSystemDesc' })}</p>
        <ul className={style['init-hints']}>
          {hints.map(text => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <div className={style['init-status']}>
          {status === 'pending' ? (
            <Flex align="center" justify="center" gap={10}>
              <Spin size="small" />
              <span>{formatMessage({ id: 'InitSystemPending' })}</span>
            </Flex>
          ) : null}
          {status === 'success' ? (
            <Flex align="center" justify="center" gap={8} className={style['init-status-success']}>
              <CheckCircleFilled />
              <span>{formatMessage({ id: 'InitSuccess' })}</span>
            </Flex>
          ) : null}
          {status === 'error' ? (
            <Flex vertical align="center" gap={12}>
              <div className={style['init-status-error']}>{errorMsg}</div>
              <Button type="primary" icon={<ReloadOutlined />} onClick={initAdmin}>
                {formatMessage({ id: 'InitSystemRetry' })}
              </Button>
            </Flex>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export default withLocale(InitAdminInner);
