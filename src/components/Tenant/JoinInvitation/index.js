import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Card, Button, Flex, Steps, Result } from 'antd';
import Fetch from '@kne/react-fetch';
import CountDown from '@kne/count-down';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CompanyInfo from '../CompanyInfo';
import { UserCard } from '../UserList';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';

const JoinInvitation = createWithRemoteLoader({
  modules: ['components-core:Layout@Page', 'components-core:Global@usePreset', 'components-core:InfoPage', 'components-core:LoadingButton']
})(({ remoteModules, baseUrl = '', children }) => {
  const [Page, usePreset, InfoPage, LoadingButton] = remoteModules;
  const [current, setCurrent] = useState(0);
  const { formatMessage } = useIntl();
  const { apis, ajax } = usePreset();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const pageProps = {
    children: (
      <Fetch
        {...Object.assign({}, apis.tenant.parseJoinToken, {
          data: { token }
        })}
        error={error => {
          return <Result status="error" title={error || formatMessage({ id: 'InviteLinkExpired' })} subTitle={formatMessage({ id: 'ContactAdmin' })} />;
        }}
        render={({ data }) => {
          const { tenant, tenantUser } = data;
          if (!(tenant && tenant.status === 'open' && tenantUser && tenantUser.status === 'open')) {
            return <Result status="error" title={formatMessage({ id: 'InviteLinkExpired' })} subTitle={formatMessage({ id: 'ContactAdmin' })} />;
          }
          return (
            <Card className={style['card']} title={formatMessage({ id: 'InviteYouJoin' }, { name: data.company.name })}>
              <Flex vertical gap={40}>
                <Steps
                  className={style['steps']}
                  current={current}
                  items={[
                    {
                      title: formatMessage({ id: 'ConfirmCompanyInfo' })
                    },
                    {
                      title: formatMessage({ id: 'ConfirmEmployeeInfo' })
                    },
                    {
                      title: formatMessage({ id: 'Complete' })
                    }
                  ]}
                />
                {current === 0 && (
                  <InfoPage>
                    <InfoPage.Part title={formatMessage({ id: 'CompanyInfo' })}>
                      <CompanyInfo.Detail data={data.company} />
                    </InfoPage.Part>
                    <Flex justify="center">
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => {
                          setCurrent(1);
                        }}>
                        {formatMessage({ id: 'ConfirmCompanyInfo' })}
                      </Button>
                    </Flex>
                  </InfoPage>
                )}
                {current === 1 && (
                  <Flex vertical gap={60}>
                    <UserCard data={data.tenantUser} />
                    <Flex justify="center">
                      <LoadingButton
                        type="primary"
                        size="large"
                        onClick={async () => {
                          const { data: resData } = await ajax(
                            Object.assign({}, apis.tenant.join, {
                              data: {
                                token
                              }
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
                    </Flex>
                  </Flex>
                )}
                {current === 2 && (
                  <Flex vertical gap={60}>
                    <Result
                      status="success"
                      title={formatMessage({ id: 'WelcomeJoin' }, { name: data.company.name })}
                      subTitle={
                        <>
                          <CountDown
                            duration={5}
                            format="s"
                            onComplete={() => {
                              window.location.href = `${baseUrl}/tenant`;
                            }}
                          />
                          {formatMessage({ id: 'AutoJump' })}
                        </>
                      }
                      extra={
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => {
                            window.location.href = `${baseUrl}/tenant`;
                          }}>
                          {formatMessage({ id: 'EnterDirectly' })}
                        </Button>
                      }
                    />
                  </Flex>
                )}
              </Flex>
            </Card>
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
