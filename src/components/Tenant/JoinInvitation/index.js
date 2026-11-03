import classnames from 'classnames';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Button, Result, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import Fetch from '@kne/react-fetch';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CompanySummary from './CompanySummary';
import EmployeeSummary from './EmployeeSummary';
import JoinSuccess from './JoinSuccess';
import TenantPageShell from '../TenantPageShell';

import withLocale from '../withLocale';
import { withPublicUrl } from '../../../utils/publicUrl';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';

const STEPS = ['ConfirmCompanyInfo', 'ConfirmEmployeeInfo', 'Complete'];

const StepProgress = withLocale(({ current }) => {
  const { formatMessage } = useIntl();
  return (
    <div className={style.progress}>
      <div className={style.progressText}>
        <span className={style.progressIndex}>{formatMessage({ id: 'JoinStepProgress' }, { current: current + 1, total: STEPS.length })}</span>
        <span className={style.progressTitle}>{formatMessage({ id: STEPS[current] })}</span>
      </div>
      <div className={style.progressBar}>
        {STEPS.map((id, index) => (
          <span key={id} className={classnames(style.progressSegment, { [style.progressSegmentDone]: index <= current })} />
        ))}
      </div>
    </div>
  );
});

const JoinInvitation = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:LoadingButton']
})(({ remoteModules, baseUrl = '', token: propsToken, systemName, systemLogo, children }) => {
  const [usePreset, LoadingButton] = remoteModules;
  const [current, setCurrent] = useState(0);
  const { formatMessage } = useIntl();
  const { apis, ajax } = usePreset();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = propsToken || searchParams.get('token');

  const renderError = (title, subTitle) => (
    <TenantPageShell systemName={systemName} systemLogo={systemLogo}>
      <Result status="error" title={title} subTitle={subTitle} />
    </TenantPageShell>
  );

  const enterSystem = () => {
    window.location.href = withPublicUrl(`${baseUrl}/tenant`);
  };

  const pageProps = {
    children: (
      <Fetch
        {...Object.assign({}, apis.tenant.parseJoinToken, {
          data: { token }
        })}
        error={error => renderError(error || formatMessage({ id: 'InviteLinkExpired' }), formatMessage({ id: 'ContactAdmin' }))}
        render={({ data }) => {
          const { tenant, tenantUser } = data;
          if (!(tenant && tenant.status === 'open' && tenantUser && tenantUser.status === 'open')) {
            return renderError(formatMessage({ id: 'InviteLinkExpired' }), formatMessage({ id: 'ContactAdmin' }));
          }
          const companyName = data.company?.name || '';

          if (current === 2) {
            return (
              <TenantPageShell systemName={systemName} systemLogo={systemLogo}>
                <JoinSuccess company={data.company} tenantUser={tenantUser} positionList={data.positionList} onEnter={enterSystem} />
              </TenantPageShell>
            );
          }

          return (
            <TenantPageShell systemName={systemName} systemLogo={systemLogo}>
              <div className={style.join}>
                <header className={style.header}>
                  <span className={style.eyebrow}>
                    <MailOutlined />
                    {formatMessage({ id: 'InviteEyebrow' })}
                  </span>
                  <Typography.Title level={4} className={style.title}>
                    {formatMessage({ id: 'InviteYouJoin' }, { name: companyName })}
                  </Typography.Title>
                  <Typography.Text type="secondary">{formatMessage({ id: 'InviteJoinSubtitle' })}</Typography.Text>
                </header>

                <StepProgress current={current} />

                <main className={style.main}>
                  {current === 0 && (
                    <>
                      <div className={style.stepHint}>{formatMessage({ id: 'ConfirmCompanyInfoHint' })}</div>
                      <CompanySummary data={data.company} />
                    </>
                  )}
                  {current === 1 && (
                    <>
                      <div className={style.stepHint}>{formatMessage({ id: 'ConfirmEmployeeInfoHint' })}</div>
                      <EmployeeSummary data={tenantUser} positionList={data.positionList} />
                    </>
                  )}
                </main>

                <footer className={style.footer}>
                  {current === 0 && (
                    <Button type="primary" size="large" className={style.footerBtn} onClick={() => setCurrent(1)}>
                      {formatMessage({ id: 'NextStep' })}
                    </Button>
                  )}
                  {current === 1 && (
                    <>
                      <Button size="large" className={style.footerBtn} onClick={() => setCurrent(0)}>
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
                        {formatMessage({ id: 'ConfirmJoin' })}
                      </LoadingButton>
                    </>
                  )}
                </footer>
              </div>
            </TenantPageShell>
          );
        }}
      />
    )
  };

  if (typeof children === 'function') {
    return children(pageProps);
  }

  return pageProps.children;
});

export default withLocale(JoinInvitation);
