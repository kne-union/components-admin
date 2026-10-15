import { createWithRemoteLoader } from '@kne/remote-loader';
import { Avatar } from 'antd';
import classnames from 'classnames';
import style from '../style.module.scss';

/**
 * 联系人头像：avatar 为文件 id（外部联系人也可传图片 URL），没有头像时显示名称首字
 */
const ContactAvatar = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, contact, size = 32, className }) => {
  const [Image] = remoteModules;
  const avatar = contact?.avatar;
  if (avatar) {
    const source = /^(https?:|data:)/.test(avatar) ? { src: avatar } : { id: avatar };
    return <Image.Avatar {...source} size={size} shape="circle" className={classnames(style['contact-avatar'], className)} />;
  }
  const text = String(contact?.name || contact?.address || '?')
    .trim()
    .charAt(0)
    .toUpperCase();
  return (
    <Avatar size={size} className={classnames(style['contact-avatar'], style['contact-avatar-text'], className)}>
      {text}
    </Avatar>
  );
});

export default ContactAvatar;
