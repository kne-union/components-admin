const { AdminLayout } = _Admin;
const { default: Task } = _Task;
const { default: TenantAdmin } = _TenantAdmin;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/Admin/admin-layout';
const pageProps = { menuFixed: false };

const AdminLayoutExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Routes>
        <Route
          path={`${baseUrl}/*`}
          element={
            <AdminLayout
              baseUrl={baseUrl}
              defaultTitle="Demo Admin"
              indexPath="user"
              pageProps={pageProps}
              navigation={{
                isFixed: false,
                // 示例预览宽度有限，去掉右侧语言/头像，避免导航项全部挤进「更多」
                rightOptions: null,
                list: [
                  {
                    key: 'task',
                    title: '任务管理',
                    path: `${baseUrl}/task`
                  },
                  {
                    key: 'tenant',
                    title: '租户管理',
                    path: `${baseUrl}/tenant`
                  }
                ]
              }}
              list={[
                {
                  path: 'task/*',
                  element: <Task baseUrl={baseUrl} pageProps={pageProps} />
                },
                {
                  path: 'tenant/*',
                  element: <TenantAdmin baseUrl={baseUrl} pageProps={pageProps} />
                }
              ]}
            />
          }
        />
        <Route path="*" element={<Navigate to={`${baseUrl}/user`} replace />} />
      </Routes>
    </PureGlobal>
  );
});

render(<AdminLayoutExample />);
