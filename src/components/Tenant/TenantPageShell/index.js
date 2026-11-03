import classnames from 'classnames';
import LoginIllustration from '@components/LoginIllustration';
import LoginOuterContainer from '../../Account/LoginOuterContainer';
import Language from '../../Account/Language';
import { Layout } from '../../Account/Account';
import style from './style.module.scss';

/** 登录后租户相关页面（选择租户、加入邀请）的外壳：复用登录页 Layout，左侧插画、右侧内容 */
const TenantPageShell = ({
  className,
  systemName,
  systemLogo,
  leftInner = <LoginIllustration type="workforce" />,
  allowLanguageSwitch = true,
  children
}) => {
  return (
    <Layout>
      <LoginOuterContainer className={classnames(style.shell, className)} title={systemName} logo={systemLogo} leftInner={leftInner}>
        {children}
        {allowLanguageSwitch && <Language colorful={false} className={style.language} />}
      </LoginOuterContainer>
    </Layout>
  );
};

export default TenantPageShell;
