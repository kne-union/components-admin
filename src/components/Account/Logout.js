import { removeToken } from '@kne/token-storage';
import { Button } from 'antd';

export const useLogout = props => {
  const { storeKeys, domain } = Object.assign({}, { storeKeys: { token: 'X-User-Token' } }, props);
  return () => {
    Object.values(storeKeys).forEach(tokenKey => {
      removeToken(tokenKey, domain);
    });
    window.location.reload();
  };
};

const Logout = ({ storeKeys, domain, ...props }) => {
  const onClick = useLogout({ storeKeys, domain });
  return <Button {...props} onClick={onClick} />;
};

export default Logout;
