import Modify from '../Modify';
import commonStyle from '../style.module.scss';
import { Button } from 'antd';
import useNavigate from '@kne/use-refer-navigate';
import { LeftOutlined } from '@ant-design/icons';

const ResetPassword = p => {
  const { type, loginUrl, title, systemName, ...props } = Object.assign(
    {},
    {
      type: 'email',
      title: '重置登录密码',
      loginUrl: ''
    },
    p
  );
  const navigate = useNavigate();
  return (
    <Modify
      {...props}
      type={type}
      title={title}
      systemName={systemName}
      isReset
      header={
        <Button
          className={commonStyle['back-link']}
          type="link"
          size="large"
          icon={<LeftOutlined />}
          onClick={() => {
            navigate(loginUrl);
          }}>
          已有账户，去登录
        </Button>
      }
    />
  );
};

export default ResetPassword;
