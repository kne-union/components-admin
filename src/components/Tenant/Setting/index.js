import { createWithRemoteLoader } from '@kne/remote-loader';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppChildrenRouter from '@kne/app-children-router';
import Company from './Company';
import Org from './Org';
import User from './User';

const Setting = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@Menu']
})(({ remoteModules, baseUrl: originalBaseUrl }) => {
  const baseUrl = `${originalBaseUrl}/setting`;
  const [usePreset, Menu] = remoteModules;
  const { apis } = usePreset();

  const menu = (
    <Menu
      items={[
        { key: 'company', label: '公司信息', path: `${baseUrl}/company` },
        {
          key: 'org',
          label: '组织架构',
          path: `${baseUrl}/org`
        },
        {
          key: 'user',
          label: '用户管理',
          path: `${baseUrl}/user`
        }
      ]}
    />
  );

  return (
    <AppChildrenRouter
      baseUrl={`${baseUrl}`}
      list={[
        {
          index: true,
          element: <Navigate to={`${baseUrl}/company`} replace />
        },
        {
          path: 'company',
          element: <Company menu={menu} />
        },
        {
          path: 'org',
          element: <Org menu={menu} />
        },
        {
          path: 'user',
          element: <User menu={menu} />
        }
      ]}
    />
  );
});

export default Setting;
