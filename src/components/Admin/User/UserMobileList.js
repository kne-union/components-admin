import { Tag } from 'antd';
import get from 'lodash/get';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import CardList from '@components/MailGateway/CardList';
import withLocale from '../withLocale';
import style from './UserMobileList.module.scss';

const STATUS = {
  0: { color: 'success', id: 'Normal' },
  10: { color: 'default', id: 'NotActivated' },
  11: { color: 'error', id: 'Disabled' },
  12: { color: 'error', id: 'Closed' }
};

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
  return asId(avatar) || (typeof avatar === 'object' && !Array.isArray(avatar) ? asId(avatar.id) || asId(avatar.fileId) || asId(avatar.file_id) : '');
};

// 与消息管理等列表共用 CardList：头像 + 名称 + 状态标签，联系方式一行一条，操作在底栏
const UserMobileList = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup', 'components-core:Image']
})(
  withLocale(({ remoteModules, dataSource = [], rowKey = 'id', layout, getActions, showLength }) => {
    const [ButtonGroup, Image] = remoteModules;
    const { formatMessage } = useIntl();

    return (
      <CardList
        dataSource={dataSource || []}
        getRowKey={item => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey)}
        layout={layout}
        renderItem={item => {
          const status = STATUS[item.status] || { color: 'default', id: 'Other' };
          const actions = (typeof getActions === 'function' ? getActions(item) : [])
            .filter(action => action && !action.hidden)
            .map(action => Object.assign({ type: 'link' }, action));
          const avatarId = resolveAvatarId(item.avatar);
          return {
            leading: <Image.Avatar className={style.avatar} id={avatarId || undefined} size={40} shape="circle" gender={item.gender || 'M'} />,
            title: item.nickname || item.email || item.phone || '-',
            extra: (
              <>
                {item.isSuperAdmin === true && <Tag color="purple">{formatMessage({ id: 'SuperAdmin' })}</Tag>}
                <Tag color={status.color}>{formatMessage({ id: status.id })}</Tag>
              </>
            ),
            muted: Number(item.status) !== 0,
            description: typeof item.description === 'string' ? item.description.trim() : undefined,
            fields: [
              { label: formatMessage({ id: 'Email' }), value: item.email || '-' },
              item.phone && { label: formatMessage({ id: 'Phone' }), value: item.phone }
            ].filter(Boolean),
            actions: actions.length ? (
              <div className={style.actions}>
                <ButtonGroup place="end" itemClassName="btn-no-padding" moreType="link" showLength={showLength} list={actions} />
              </div>
            ) : null
          };
        }}
      />
    );
  })
);

export default UserMobileList;
