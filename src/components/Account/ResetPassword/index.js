import Modify from '../Modify';
import commonStyle from '../style.module.scss';
import { Button } from 'antd';
import useNavigate from '@kne/use-refer-navigate';
import { LeftOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

const ResetPasswordInner = p => {
  const { formatMessage } = useIntl();
  const { type, loginUrl, title, systemName, ...props } = Object.assign(
    {},
    {
      type: 'email',
      title: formatMessage({ id: 'ResetLoginPassword' }),
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
          {formatMessage({ id: 'HasAccountLogin2' })}
        </Button>
      }
    />
  );
};

export default withLocale(ResetPasswordInner);
