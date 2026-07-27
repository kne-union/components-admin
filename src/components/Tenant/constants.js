import { WechatWorkOutlined, DingdingOutlined, CloudOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import style from './sourceIcon.module.scss';

const BEISEN_LOGO_URL = 'https://www.beisen.com/public/mobile/index/images/logo2.svg';

const SOURCE_LABEL_MAP = {
  wecom: '企业微信',
  dingtalk: '钉钉',
  beisen: '北森'
};

const SOURCE_ICON_MAP = {
  wecom: WechatWorkOutlined,
  dingtalk: DingdingOutlined,
  beisen: BEISEN_LOGO_URL
};

const getSourceIcon = (source, props = {}) => {
  const icon = SOURCE_ICON_MAP[source];
  if (!icon) {
    return <CloudOutlined {...props} />;
  }
  if (typeof icon === 'string') {
    const { style: inlineStyle, alt, className, ...rest } = props;
    return (
      <img
        src={icon}
        alt={alt || SOURCE_LABEL_MAP[source] || source}
        {...rest}
        className={classnames(style['source-img-icon'], className)}
        style={inlineStyle}
      />
    );
  }
  const IconComponent = icon;
  return <IconComponent {...props} />;
};

const SOURCE_TAG_CLASS = style['source-tag'];

export { SOURCE_LABEL_MAP, SOURCE_ICON_MAP, getSourceIcon, BEISEN_LOGO_URL, SOURCE_TAG_CLASS };
