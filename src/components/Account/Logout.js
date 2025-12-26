import { removeToken } from '@kne/token-storage';
import merge from 'lodash/merge';
import { Button } from 'antd';

export const useLogout = props => {
  const { storeKeys, domain, loginUrl } = merge({}, { storeKeys: { token: 'X-User-Token' }, loginUrl: '/account/login' }, props);
  return () => {
    Object.values(storeKeys).forEach(tokenKey => {
      removeToken(tokenKey, domain);
    });
    window.location.href = `${loginUrl}?referer=${encodeURIComponent(window.location.href)}`;
  };
};

const Logout = ({ storeKeys, domain, ...props }) => {
  const onClick = useLogout({ storeKeys, domain });
  return <Button {...props} onClick={onClick} />;
};

export default Logout;
