import '@kne/react-box/dist/index.css'; // personal-card layout
import { createWithRemoteLoader } from '@kne/remote-loader';
import { PersonalCard } from '@kne/react-box';
import { Tag } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

/** 头像字段可能是文件 id 字符串，也可能是 { id }；对象本身不能当 id（会变成 [object Object]） */
const resolveAvatarId = avatar => {
  const asId = value => {
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim();
      return text && text !== '[object Object]' ? text : '';
    }
    return '';
  };
  if (avatar == null || avatar === false) {
    return '';
  }
  const direct = asId(avatar);
  if (direct) {
    return direct;
  }
  if (typeof avatar === 'object' && !Array.isArray(avatar)) {
    return asId(avatar.id) || asId(avatar.fileId) || asId(avatar.file_id);
  }
  return '';
};

const getStatusText = (status, formatMessage) => {
  if (status === 0) {
    return { type: 'success', text: formatMessage({ id: 'Normal' }) };
  }
  if (status === 10) {
    return { text: formatMessage({ id: 'NotActivated' }) };
  }
  if (status === 11) {
    return { type: 'danger', text: formatMessage({ id: 'Disabled' }) };
  }
  if (status === 12) {
    return { type: 'danger', text: formatMessage({ id: 'Closed' }) };
  }
  return { text: formatMessage({ id: 'Other' }) };
};

const buildPersonalCardProps = (data, { Image, formatMessage }) => {
  const status = getStatusText(data?.status, formatMessage);
  const moreInfo = [
    {
      key: 'status',
      label: formatMessage({ id: 'Status' }),
      content: (
        <>
          <span>{formatMessage({ id: 'Status' })}：</span>
          <Tag color={status.type === 'success' ? 'success' : status.type === 'danger' ? 'error' : 'default'}>{status.text}</Tag>
        </>
      )
    },
    {
      key: 'isSuperAdmin',
      label: formatMessage({ id: 'IsSuperAdmin' }),
      content: (
        <>
          <span>{formatMessage({ id: 'IsSuperAdmin' })}：</span>
          {data?.isSuperAdmin === true ? formatMessage({ id: 'Yes' }) : formatMessage({ id: 'No' })}
        </>
      )
    }
  ];

  const avatarId = resolveAvatarId(data?.avatar);

  return {
    mode: 'vertical',
    name: data?.nickname,
    email: data?.email,
    phone: data?.phone,
    description: typeof data?.description === 'string' && data.description.trim() ? data.description.trim() : undefined,
    moreInfo,
    // 用 PersonalCard 传入的像素 size 做宽高占位；100% 在图片未加载时 ant-avatar 会塌成默认尺寸
    avatar: ({ className, size }) => (
      <Image.Avatar className={className} id={avatarId || undefined} size={size || 80} shape="circle" gender={data?.gender || 'M'} />
    )
  };
};

const UserPersonalCard = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, data, className, extra, footer, selected }) => {
  const [Image] = remoteModules;
  const { formatMessage } = useIntl();

  if (!data) {
    return null;
  }

  return (
    <PersonalCard
      className={className}
      extra={extra}
      footer={footer}
      selected={selected}
      {...buildPersonalCardProps(data, { Image, formatMessage })}
    />
  );
});

export default withLocale(UserPersonalCard);
