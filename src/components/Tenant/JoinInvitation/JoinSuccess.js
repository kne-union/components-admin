import { Button, Typography } from 'antd';
import { CheckOutlined, ArrowRightOutlined } from '@ant-design/icons';
import CountDown from '@kne/count-down';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import getUserOrgDisplayItems from '../UserList/getUserOrgDisplayItems';
import { CompanyLogo } from './CompanySummary';
import { UserAvatar, resolvePosition } from './EmployeeSummary';
import style from './style.module.scss';

const JoinSuccess = withLocale(({ company, tenantUser, positionList, onEnter }) => {
  const { formatMessage } = useIntl();
  const companyName = company?.name || '';
  const userMeta = [resolvePosition(tenantUser, positionList), getUserOrgDisplayItems(tenantUser)[0]?.label].filter(Boolean).join(' · ');

  return (
    <div className={style.success}>
      <span className={style.successBadge}>
        <CheckOutlined />
      </span>
      <Typography.Title level={4} className={style.successTitle}>
        {formatMessage({ id: 'WelcomeJoin' }, { name: companyName })}
      </Typography.Title>
      <div className={style.successDesc}>{formatMessage({ id: 'JoinSuccessDesc' })}</div>

      <div className={style.successIdentity}>
        <div className={style.successIdentityRow}>
          <CompanyLogo company={company} size={40} />
          <div className={style.successIdentityBody}>
            <div className={style.successIdentityName}>{companyName}</div>
            {company?.fullName && company.fullName !== companyName && <div className={style.successIdentityMeta}>{company.fullName}</div>}
          </div>
        </div>
        <div className={style.successIdentityRow}>
          <UserAvatar user={tenantUser} size={40} />
          <div className={style.successIdentityBody}>
            <div className={style.successIdentityName}>{tenantUser?.name}</div>
            {userMeta && <div className={style.successIdentityMeta}>{userMeta}</div>}
          </div>
        </div>
      </div>

      <Button type="primary" size="large" block className={style.successButton} onClick={onEnter}>
        {formatMessage({ id: 'EnterDirectly' })}
        <ArrowRightOutlined />
      </Button>
      <div className={style.successCountdown}>
        <span className={style.countdownNum}>
          <CountDown duration={5} format="s" onComplete={onEnter} />
        </span>
        {formatMessage({ id: 'AutoJump' })}
      </div>
    </div>
  );
});

export default JoinSuccess;
