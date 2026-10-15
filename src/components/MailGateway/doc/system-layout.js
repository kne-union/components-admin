const { default: MailGateway, getMenuItems } = _MailGateway;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { default: SystemLayout, Page } = _systemLayout;
const { Route, Routes, Navigate } = reactRouterDom;

const baseUrl = '/MailGateway/system-layout';

const menu = { base: baseUrl, items: getMenuItems() };

// 各子页面的标题与内容交给 system-layout 的 Page 承载，模块不再渲染自带的左侧菜单
const renderPage = ({ title, children }) => <Page title={title}>{children}</Page>;

const SystemLayoutExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <SystemLayout userInfo={{ name: '林晓', description: '客服主管 · 领英智能' }} menu={menu}>
        <Routes>
          <Route path={`${baseUrl}/*`} element={<MailGateway baseUrl={baseUrl} renderPage={renderPage} />} />
          <Route path="*" element={<Navigate to={baseUrl} replace />} />
        </Routes>
      </SystemLayout>
    </PureGlobal>
  );
});

render(<SystemLayoutExample />);
