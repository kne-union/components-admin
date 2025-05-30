import { createWithRemoteLoader } from '@kne/remote-loader';
import { useEffect } from 'react';
import useRefCallback from '@kne/use-ref-callback';
import { useNavigate } from 'react-router-dom';
import { Result, App } from 'antd';

const InitAdmin = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, baseUrl = '/admin' }) => {
  const [usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const initAdmin = useRefCallback(async () => {
    const { data: resData } = await ajax(Object.assign({}, apis.admin.initSuperAdmin));
    if (resData.code !== 0) {
      return;
    }
    message.success('初始化管理员成功！');
    navigate(baseUrl, { replace: true });
  });

  useEffect(() => {
    initAdmin();
  }, [initAdmin]);
  return (
    <Result
      status="warning"
      title="初始化系统"
      subTitle="当前用户将被初始化为系统的超级管理员，本操作只能执行一次，执行完成后由该用户来执行其他的管理操作。"
    />
  );
});

export default InitAdmin;
