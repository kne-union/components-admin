import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from './context';
import User from './User';

const Admin = ({ baseUrl, ...props }) => {
  return (
    <Provider value={{ baseUrl, ...props }}>
      <Routes>
        <Route path="user" element={<User />} />
        <Route element={<Navigate to={`${baseUrl}/user`} replace />} />
      </Routes>
    </Provider>
  );
};

export default Admin;

export { default as InitAdmin } from './InitAdmin';
