import merge from 'lodash/merge';
import { Button } from 'antd';
import { createLogoutHandler } from '../../utils/accountLogout';

export const useLogout = props => {
  const config = merge({}, { storeKeys: { token: 'X-User-Token' }, loginUrl: '/account/login' }, props);
  return createLogoutHandler(config);
};

const Logout = ({ storeKeys, domain, ...props }) => {
  const onClick = useLogout({ storeKeys, domain });
  return <Button {...props} onClick={onClick} />;
};

export default Logout;
