import { createWithRemoteLoader } from '@kne/remote-loader';
import { Divider, List, Dropdown, Space, Flex, Modal } from 'antd';
import { useLogout } from '@components/Account';
import style from './style.module.scss';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import classnames from 'classnames';
import { useState } from 'react';
import { useMobilePopupMount } from '@kne/responsive-utils';

const UserTool = createWithRemoteLoader({
  modules: ['components-core:Image', 'components-core:Icon']
})(
  withLocale(({ remoteModules, avatar, name, email, storeKeys = { token: 'X-User-Token' }, domain, list, children = null }) => {
    const [Image, Icon] = remoteModules;
    const logout = useLogout({ storeKeys, domain });
    const { formatMessage } = useIntl();
    const [open, setOpen] = useState(false);
    const { isMobile, getPopupContainer, fixedModeClass, anchorRef } = useMobilePopupMount();

    const closePanel = () => setOpen(false);

    const panelContent = (
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
                <List.Item
                  key={index}
                  className={style['options-list-item']}
                  onClick={() => {
                    closePanel();
                    item.onClick && item.onClick();
                  }}>
                  <Flex gap={8} flex={1}>
                    {item.iconType && <Icon type={item.iconType} />}
                    <Flex flex={1}>{item.label}</Flex>
                  </Flex>
                </List.Item>
              );
            })}
          <List.Item
            className={style['options-list-item']}
            onClick={() => {
              closePanel();
              logout();
            }}>
            <Flex gap={8} flex={1}>
              <Icon type="icon-tuichudenglu" />
              <span>{formatMessage({ id: 'UserToolLogout' })}</span>
            </Flex>
          </List.Item>
        </List>
      </Space>
    );

    const trigger = (
      <div
        ref={anchorRef}
        className={classnames(style['user-tool'], {
          [style['is-mobile']]: isMobile
        })}
        onClick={
          isMobile
            ? e => {
                e.stopPropagation();
                setOpen(true);
              }
            : undefined
        }>
        <Space>
          <Image.Avatar id={avatar} size={32} />
          {!isMobile && <div className={classnames(style['user-name'], 'user-tool-username')}>{name || formatMessage({ id: 'UserToolUnnamed' })}</div>}
          {!isMobile && <Icon className={style['icon']} type="triangle-down" size={12} />}
        </Space>
      </div>
    );

    if (isMobile) {
      return (
        <>
          {trigger}
          <Modal
            open={open}
            onCancel={closePanel}
            footer={null}
            centered
            width={320}
            title={null}
            closable
            destroyOnHidden
            getContainer={getPopupContainer}
            className={classnames(style['mobile-modal'], fixedModeClass)}
            classNames={{
              body: style['mobile-modal-body']
            }}>
            {panelContent}
          </Modal>
        </>
      );
    }

    return (
      <Dropdown
        trigger={['click']}
        open={open}
        onOpenChange={setOpen}
        rootClassName={style['overlay']}
        popupRender={() => panelContent}
        arrow={false}
        transitionName={'ant-slide-up'}>
        {trigger}
      </Dropdown>
    );
  })
);

export default UserTool;
