import { WechatWorkOutlined, DingdingOutlined, CloudOutlined } from '@ant-design/icons';

const SOURCE_LABEL_MAP = {
  wecom: '企业微信',
  dingtalk: '钉钉'
};

const SOURCE_ICON_MAP = {
  wecom: WechatWorkOutlined,
  dingtalk: DingdingOutlined
};

const getSourceIcon = source => {
  const IconComponent = SOURCE_ICON_MAP[source];
  return IconComponent ? <IconComponent /> : <CloudOutlined />;
};

export { SOURCE_LABEL_MAP, SOURCE_ICON_MAP, getSourceIcon };
