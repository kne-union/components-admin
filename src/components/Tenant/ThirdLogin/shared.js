import { LoginOuterContainer, Layout } from '@components/Account';
import { Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import { SOURCE_LABEL_MAP, SOURCE_ICON_MAP, getSourceIcon } from '../constants';
import style from './style.module.scss';

export const usePlatformShell = platform => {
  const { formatMessage } = useIntl();
  const title = SOURCE_LABEL_MAP[platform] || formatMessage({ id: 'ThirdLogin' });
  const icon = SOURCE_ICON_MAP[platform];
  // LoginOuterContainer 支持 string URL 或 ReactNode
  const logo = !icon ? null : typeof icon === 'string' ? icon : getSourceIcon(platform);
  return { formatMessage, title, logo };
};

export const ThirdLoginPanel = ({ title, logo, children }) => (
  <Layout>
    <LoginOuterContainer title={title} logo={logo}>
      <div className={style.panel}>{children}</div>
    </LoginOuterContainer>
  </Layout>
);

export const ThirdLoginLoading = ({ title, logo, tip }) => (
  <ThirdLoginPanel title={title} logo={logo}>
    <div className={style.loadingPanel}>
      <Spin size="large" />
      <p className={style.statusTip}>{tip}</p>
    </div>
  </ThirdLoginPanel>
);

export const ThirdLoginError = ({ title, logo, message, tip }) => (
  <ThirdLoginPanel title={title} logo={logo}>
    <div className={style.status}>
      <p className={style.errorTitle}>{message}</p>
      {tip ? <p className={style.subtitle}>{tip}</p> : null}
    </div>
  </ThirdLoginPanel>
);
