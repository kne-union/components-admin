import { LoginOuterContainer } from '@components/Account';
import { Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import { SOURCE_LABEL_MAP, SOURCE_ICON_MAP, getSourceIcon } from '../constants';
import style from './style.module.scss';

export const usePlatformShell = platform => {
  const { formatMessage } = useIntl();
  const title = SOURCE_LABEL_MAP[platform] || formatMessage({ id: 'ThirdLogin' });
  const logo = SOURCE_ICON_MAP[platform] ? getSourceIcon(platform) : null;
  return { formatMessage, title, logo };
};

export const ThirdLoginPanel = ({ title, logo, children }) => (
  <LoginOuterContainer title={title} logo={logo}>
    <div className={style.panel}>{children}</div>
  </LoginOuterContainer>
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
