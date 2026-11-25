import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from './context';
import User from './User';
import AdminLayout from './AdminLayout';
import PlatformManagement, { Mcp, McpSettings } from './PlatformManagement';
import McpKeys, { InstallMcp as McpInstall } from './PlatformManagement/Mcp/Keys';

const Admin = ({ baseUrl, pageProps, ...props }) => {
  return (
    <Provider value={{ baseUrl, pageProps, ...props }}>
      <Routes>
        <Route path="user" element={<User pageProps={pageProps} />} />
        <Route element={<Navigate to={`${baseUrl}/user`} replace />} />
      </Routes>
    </Provider>
  );
};

Admin.User = User;
Admin.AdminLayout = AdminLayout;
Admin.PlatformManagement = PlatformManagement;
Admin.Mcp = Mcp;
Admin.McpSettings = McpSettings;
Admin.McpKeys = McpKeys;
Admin.McpInstall = McpInstall;

export default Admin;

export { default as InitAdmin } from './InitAdmin';
export { default as AdminLayout } from './AdminLayout';
export { default as PlatformManagement, Mcp, McpSettings } from './PlatformManagement';
export { default as McpKeys, InstallMcp as McpInstall } from './PlatformManagement/Mcp/Keys';
export { getBuiltinAdminNav, getBuiltinAdminRoutes } from './AdminLayout';
export { User };
