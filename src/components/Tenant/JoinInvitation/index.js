import '@kne/react-box/dist/index.css';
import classnames from 'classnames';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Button, Steps, Result, Typography } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import Fetch from '@kne/react-fetch';
import CountDown from '@kne/count-down';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CompanyInfo from '../CompanyInfo';
import TenantUserPersonalCard from '../UserList/UserPersonalCard';

import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';

const companyInitial = name => {
  const text = String(name || '').trim();
  return text ? text.charAt(0).toUpperCase() : '?';
};

const JoinInvitation = createWithRemoteLoader({
  modules: [
    'components-core:Layout@Page',
    'components-core:Global@usePreset',
    'components-core:LoadingButton',
    'components-core:Image'
  ]
})(({ remoteModules, baseUrl = '', token: propsToken, children }) => {
  const [Page, usePreset, LoadingButton, Image] = remoteModules;
  const [current, setCurrent] = useState(0);
  const { formatMessage } = useIntl();
  const { apis, ajax } = usePreset();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = propsToken || searchParams.get('token');

  const renderError = (title, subTitle) => (
    <div className={style.page}>
      <div className={classnames(style.shell, style.shellError)}>
        <Result status="error" title={title} subTitle={subTitle} />
      </div>
    </div>
  );

  const renderHeader = company => (
    <header className={style.header}>
      {company?.logo ? (
        <div className={style.headerLogo}>
          <Image.Avatar id={company.logo} size={56} alt={company.name} />
        </div>
      ) : (
        <div className={style.headerLogoFallback} aria-hidden>
          {companyInitial(company?.name)}
        </div>
      )}
      <div className={style.headerText}>
        <Typography.Title level={4} className={style.headerTitle}>
          {formatMessage({ id: 'InviteYouJoin' }, { name: company?.name || '' })}
        </Typography.Title>
        <Typography.Paragraph className={style.headerSubtitle}>
          {formatMessage({ id: 'InviteJoinSubtitle' })}
        </Typography.Paragraph>
      </div>
    </header>
  );

  const pageProps = {
    children: (
      <Fetch
        {...Object.assign({}, apis.tenant.parseJoinToken, {
          data: { token }
        })}
        error={error =>
          renderError(error || formatMessage({ id: 'InviteLinkExpired' }), formatMessage({ id: 'ContactAdmin' }))
        }
        render={({ data }) => {
          const { tenant, tenantUser } = data;
          if (!(tenant && tenant.status === 'open' && tenantUser && tenantUser.status === 'open')) {
            return renderError(formatMessage({ id: 'InviteLinkExpired' }), formatMessage({ id: 'ContactAdmin' }));
          }

          const stepItems = [
            { title: formatMessage({ id: 'ConfirmCompanyInfo' }) },
            { title: formatMessage({ id: 'ConfirmEmployeeInfo' }) },
            { title: formatMessage({ id: 'Complete' }) }
          ];

          let footerClassName = style.footer;
          let footerNode = null;

          if (current === 0) {
            footerNode = (
              <Button
                type="primary"
                size="large"
                className={style.footerBtn}
                onClick={() => {
                  setCurrent(1);
                }}>
                {formatMessage({ id: 'ConfirmCompanyInfo' })}
              </Button>
            );
          } else if (current === 1) {
            footerNode = (
              <>
                <Button
                  size="large"
                  className={style.footerBtn}
                  onClick={() => {
                    setCurrent(0);
                  }}>
                  {formatMessage({ id: 'StepBack' })}
                </Button>
                <LoadingButton
                  type="primary"
                  size="large"
                  className={style.footerBtn}
                  onClick={async () => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.tenant.join, {
                        data: { token }
                      })
                    );
                    if (resData.code !== 0) {
                      navigate(`${baseUrl}/login-tenant`);
                      return;
                    }
                    setCurrent(2);
                  }}>
                  {formatMessage({ id: 'ConfirmEmployeeInfo' })}
                </LoadingButton>
              </>
            );
          } else if (current === 2) {
            footerNode = (
              <Button
                type="primary"
                size="large"
                className={style.footerBtn}
                onClick={() => {
                  window.location.href = `${baseUrl}/tenant`;
                }}>
                {formatMessage({ id: 'EnterDirectly' })}
              </Button>
            );
          }

          return (
            <div className={style.page}>
              <div className={style.shell}>
                {renderHeader(data.company)}
                <div className={style.content}>
                  <div className={style.stepsWrap}>
                    <Steps
                      current={current}
                      size="small"
                      orientation="horizontal"
                      titlePlacement="vertical"
                      responsive={false}
                      items={stepItems}
                    />
                  </div>
                  <main className={style.main}>
                    {current === 0 && (
                    <div className={classnames(style.stepPanel, style.stepPanelCompany)}>
                      <CompanyInfo.Detail data={data.company} />
                    </div>
                  )}
                  {current === 1 && (
                    <div className={classnames(style.stepPanel, style.stepPanelEmployee)}>
                      <Typography.Paragraph className={style.stepHint}>
                        {formatMessage({ id: 'ConfirmEmployeeInfoHint' })}
                      </Typography.Paragraph>
                      <TenantUserPersonalCard
                        data={tenantUser}
                        positionList={data.positionList}
                      />
                    </div>
                  )}
                  {current === 2 && (
                    <div className={classnames(style.stepPanel, style.stepPanelSuccess)}>
                      <CheckCircleFilled className={style.successIcon} />
                      <Typography.Title level={4} className={style.successTitle}>
                        {formatMessage({ id: 'WelcomeJoin' }, { name: data.company.name })}
                      </Typography.Title>
                      <Typography.Paragraph className={style.successSub}>
                        <span className={style.countdownNum}>
                          <CountDown
                            duration={5}
                            format="s"
                            onComplete={() => {
                              window.location.href = `${baseUrl}/tenant`;
                            }}
                          />
                        </span>
                        {formatMessage({ id: 'AutoJump' })}
                      </Typography.Paragraph>
                    </div>
                  )}
                  </main>
                </div>
                {footerNode ? <footer className={footerClassName}>{footerNode}</footer> : null}
              </div>
            </div>
          );
        }}
      />
    )
  };

  if (typeof children === 'function') {
    return children(pageProps);
  }

  return <Page backgroundColor="transparent" {...pageProps} />;
});

export default withLocale(JoinInvitation);
