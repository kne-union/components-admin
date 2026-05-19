import { Tag } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';

const OrgNodeUserCount = ({ count }) => {
  const { formatMessage } = useIntl();
  if (count == null || Number.isNaN(Number(count))) {
    return null;
  }
  return (
    <Tag className={style['org-user-count']} icon={<TeamOutlined />}>
      {formatMessage({ id: 'OrgUserCount' }, { count: Number(count) })}
    </Tag>
  );
};

export default OrgNodeUserCount;
