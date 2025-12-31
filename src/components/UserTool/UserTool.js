import { createWithRemoteLoader } from '@kne/remote-loader';
import { Divider, List, Dropdown, Space, Flex } from 'antd';
import { useLogout } from '@components/Account';
import style from './style.module.scss';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';

const UserTool = createWithRemoteLoader({
  modules: ['components-core:Image', 'components-core:Icon']
})(withLocale(({ remoteModules, avatar, name, email, storeKeys = { token: 'X-User-Token' }, domain, list, children = null }) => {
  const [Image, Icon] = remoteModules;
  const logout = useLogout({ storeKeys, domain });
  const { formatMessage } = useIntl();
  return (
    <Dropdown
      trigger="click"
      rootClassName={style['overlay']}
      popupRender={() => (
        <Space direction={'vertical'} className={style['content']}>
          <Space className={style['info']}>
            <Image.Avatar id={avatar} size={48} />
            <div>
              <div className={style['line']}>{name || formatMessage({ id: 'UserToolUnnamed' })}</div>
              <div className={style['line']}>{email || '-'}</div>
            </div>
          </Space>
          <Divider className={style['divider']} />
          {children}
          <List className={style['options-list']}>
            {list &&
              list.length > 0 &&
              list.map((item, index) => {
                return (
                  <List.Item key={index} className={style['options-list-item']} onClick={item.onClick}>
                    <Flex gap={8} flex={1}>
                      {item.iconType && <Icon type={item.iconType} />}
                      <Flex flex={1}>{item.label}</Flex>
                    </Flex>
                  </List.Item>
                );
              })}
            <List.Item
              className={style['options-list-item']}
              onClick={logout}>
              <Flex gap={8} flex={1}>
                <Icon type="icon-tuichudenglu" />
                <span>{formatMessage({ id: 'UserToolLogout' })}</span>
              </Flex>
            </List.Item>
          </List>
        </Space>
      )}
      arrow={false}
      transitionName={'ant-slide-up'}>
      <Space className={style['user-tool']}>
        <Image.Avatar id={avatar} size={32} />
        <div className={style['user-name']}>{name || formatMessage({ id: 'UserToolUnnamed' })}</div>
        <Icon className={style['icon']} type="triangle-down" size={12} />
      </Space>
    </Dropdown>
  );
}));

export default UserTool;
