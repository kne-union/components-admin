import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from './context';
import User from './User';

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

export default Admin;

export { default as InitAdmin } from './InitAdmin';
export { User };
