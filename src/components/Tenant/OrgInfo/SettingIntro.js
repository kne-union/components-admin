import { Flex } from 'antd';
import style from './style.module.scss';

const SettingIntro = ({ icon, title, description }) => (
  <Flex className={style['setting-intro']} gap={12} align="flex-start">
    <span className={style['setting-intro-icon']}>{icon}</span>
    <Flex vertical gap={2} className={style['setting-intro-body']}>
      <span className={style['setting-intro-title']}>{title}</span>
      <span className={style['setting-intro-desc']}>{description}</span>
    </Flex>
  </Flex>
);

export default SettingIntro;
