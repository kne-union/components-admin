import { createWithRemoteLoader } from '@kne/remote-loader';
import { useState } from 'react';
import { Card, Button, Flex, Steps, Result } from 'antd';
import Fetch from '@kne/react-fetch';
import CountDown from '@kne/count-down';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CompanyInfo from '../CompanyInfo';
import { UserCard } from '../UserList';
import style from './style.module.scss';

const JoinInvitation = createWithRemoteLoader({
  modules: ['components-core:Layout@Page', 'components-core:Global@usePreset', 'components-core:InfoPage', 'components-core:LoadingButton']
})(({ remoteModules, baseUrl = '', children }) => {
  const [Page, usePreset, InfoPage, LoadingButton] = remoteModules;
  const [current, setCurrent] = useState(0);
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
          return <Result status="error" title={error || '邀请链接已失效'} subTitle="请联系管理员解决此问题" />;
        }}
        render={({ data }) => {
          const { tenant, tenantUser } = data;
          if (!(tenant && tenant.status === 'open' && tenantUser && tenantUser.status === 'open')) {
            return <Result status="error" title="邀请链接已失效" subTitle="请联系管理员解决此问题" />;
          }
          return (
            <Card className={style['card']} title={`邀请您加入【${data.company.name}】`}>
              <Flex vertical gap={40}>
                <Steps
                  className={style['steps']}
                  current={current}
                  items={[
                    {
                      title: '确认公司信息'
                    },
                    {
                      title: '确认员工信息'
                    },
                    {
                      title: '完成'
                    }
                  ]}
                />
                {current === 0 && (
                  <InfoPage>
                    <InfoPage.Part title="公司信息">
                      <CompanyInfo.Detail data={data.company} />
                    </InfoPage.Part>
                    <Flex justify="center">
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => {
                          setCurrent(1);
                        }}>
                        确认公司信息
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
                        确认员工信息
                      </LoadingButton>
                    </Flex>
                  </Flex>
                )}
                {current === 2 && (
                  <Flex vertical gap={60}>
                    <Result
                      status="success"
                      title={`欢迎您加入【${data.company.name}】！`}
                      subTitle={
                        <>
                          <CountDown
                            duration={5}
                            format="s"
                            onComplete={() => {
                              window.location.href = `${baseUrl}/tenant`;
                            }}
                          />
                          秒后自动跳转到系统首页
                        </>
                      }
                      extra={
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => {
                            window.location.href = `${baseUrl}/tenant`;
                          }}>
                          直接进入
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

export default JoinInvitation;
