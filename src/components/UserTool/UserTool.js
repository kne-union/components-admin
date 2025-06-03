import { createWithRemoteLoader } from '@kne/remote-loader';
import { Divider, List, Dropdown, Space } from 'antd';
import { removeToken } from '@kne/token-storage';
import style from './style.module.scss';

const UserTool = createWithRemoteLoader({
  modules: ['components-core:Image', 'components-core:Icon', 'components-core:Global@usePreset']
})(({ remoteModules, avatar, name, email, orgName, storeKeys = { token: 'X-User-Token' }, domain }) => {
  const [Image, Icon, usePreset] = remoteModules;
  const { ajax, apis } = usePreset();

  return (
    <Dropdown
      trigger="click"
      rootClassName={style['overlay']}
      popupRender={() => (
        <Space direction={'vertical'} className={style['content']}>
          <Space className={style['info']}>
            <Image.Avatar id={avatar} size={48} />
            <div>
              <div className={style['line']}>{name || '未命名'}</div>
              <div className={style['line']}>{email || '-'}</div>
            </div>
          </Space>
          <Divider className={style['divider']} />
          <List className={style['options-list']}>
            <List.Item
              className={style['options-list-item']}
              onClick={() => {
                Object.values(storeKeys).forEach(tokenKey => {
                  removeToken(tokenKey, domain);
                });
                window.location.reload();
              }}
            >
              <Space>
                <Icon type="icon-tuichudenglu" />
                <span>退出登录</span>
              </Space>
            </List.Item>
          </List>
        </Space>
      )}
      arrow={false}
      transitionName={'ant-slide-up'}
    >
      <Space className={style['user-tool']}>
        <Image.Avatar id={avatar} size={32} />
        <div className={style['user-name']}>{name || '未命名'}</div>
        <Icon className={style['icon']} type="triangle-down" size={12} />
      </Space>
    </Dropdown>
  );
});

export default UserTool;
