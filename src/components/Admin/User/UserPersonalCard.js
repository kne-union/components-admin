import '@kne/react-box/dist/index.css';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { PersonalCard } from '@kne/react-box';
import { Tag } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';

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

  return {
    mode: 'vertical',
    name: data?.nickname,
    email: data?.email,
    phone: data?.phone,
    description: data?.description,
    moreInfo,
    avatar: ({ className }) => (
      <Image.Avatar className={className} id={data?.avatar} size={56} gender={data?.gender || 'M'} />
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
