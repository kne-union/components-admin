import { createWithRemoteLoader } from '@kne/remote-loader';
import { useEffect } from 'react';
import useRefCallback from '@kne/use-ref-callback';
import { useNavigate } from 'react-router-dom';
import { Result, App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';

const InitAdminInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, baseUrl = '/admin' }) => {
  const [usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const initAdmin = useRefCallback(async () => {
    const { data: resData } = await ajax(Object.assign({}, apis.admin.initSuperAdmin));
    if (resData.code !== 0) {
      return;
    }
    message.success(formatMessage({ id: 'InitSuccess' }));
    navigate(baseUrl, { replace: true });
  });

  useEffect(() => {
    initAdmin();
  }, [initAdmin]);
  return (
    <Result
      status="warning"
      title={formatMessage({ id: 'InitSystem' })}
      subTitle={formatMessage({ id: 'InitSystemDesc' })}
    />
  );
});

export default withLocale(InitAdminInner);
