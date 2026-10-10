import { createWithRemoteLoader } from '@kne/remote-loader';
import { useSearchParams } from 'react-router-dom';
import { App, Button, Flex, Result, Spin, Tag, Typography, Empty, Avatar } from 'antd';
import { CheckOutlined, UserOutlined } from '@ant-design/icons';
import Fetch from '@kne/react-fetch';
import { useIntl } from '@kne/react-intl';
import { useState } from 'react';
import classnames from 'classnames';
import md5 from 'md5';
import LoginIllustration from '@components/LoginIllustration';
import LoginOuterContainer from '../Account/LoginOuterContainer';
import LoginComponent from '../Account/Login';
import Language from '../Account/Language';
import { Layout } from '../Account/Account';
import { ExpiredIcon } from './CallbackIcons';
import ResultPanel from './ResultPanel';
import withLocale from './withLocale';
import { withPublicUrl } from '../../utils/publicUrl';
import style from './style.module.scss';

const defaultLeftInner = <LoginIllustration type="workforce" />;

const ACCOUNT_STATUS_MESSAGES = {
  10: 'OidcAccountNotInitialized',
  11: 'OidcAccountDisabled',
  12: 'OidcAccountClosed'
};

const useInteractionSubmit = ({ ajax, uid }) => {
  const [loading, setLoading] = useState(false);
  const submit = async (api, data) => {
    setLoading(true);
    try {
      const { data: resData } = await ajax(Object.assign({}, api, { urlParams: { uid }, data: data || {} }));
      if (resData.code !== 0) {
        return null;
      }
      if (resData.data?.redirectTo) {
        window.location.assign(resData.data.redirectTo);
      }
      return resData.data;
    } finally {
      setLoading(false);
    }
  };
  return { loading, submit };
};

const CurrentUser = ({ user }) => {
  const { formatMessage } = useIntl();
  if (!user) {
    return null;
  }
  return (
    <Flex className={style['current-user']} align="center" gap={8}>
      <Avatar size="small" icon={<UserOutlined />} />
      <Typography.Text type="secondary">{formatMessage({ id: 'OidcCurrentAccount' })}</Typography.Text>
      <Typography.Text>{user.nickname || user.email || user.phone}</Typography.Text>
    </Flex>
  );
};

const LoginStep = ({ data, apis, submit, accountType, registerUrl, forgetUrl, title, isSelfClient }) => {
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const clientName = isSelfClient ? null : data.client?.clientName;
  return (
    <LoginComponent
      title={title || (clientName ? formatMessage({ id: 'OidcLoginTo' }, { clientName }) : formatMessage({ id: 'OidcLoginTitle' }))}
      type={accountType}
      registerUrl={registerUrl}
      forgetUrl={forgetUrl}
      onSubmit={async formData => {
        const result = await submit(apis.login, {
          type: accountType,
          [accountType]: formData[accountType],
          password: md5(formData.password)
        });
        if (result && !result.redirectTo && ACCOUNT_STATUS_MESSAGES[result.status]) {
          message.warning(formatMessage({ id: ACCOUNT_STATUS_MESSAGES[result.status] }));
        }
      }}
    />
  );
};

const TenantStep = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, data, apis, submit, loading }) => {
  const [Image] = remoteModules;
  const { formatMessage } = useIntl();
  const list = data.tenants?.list || [];
  const defaultTenantId = data.tenants?.defaultTenantId || data.params?.tenantId;
  const [selecting, setSelecting] = useState(null);
  return (
    <Flex vertical gap={24}>
      <div>
        <Typography.Title level={4}>{formatMessage({ id: 'OidcSelectTenant' })}</Typography.Title>
        <Typography.Text type="secondary">{formatMessage({ id: 'OidcSelectTenantDesc' })}</Typography.Text>
      </div>
      <CurrentUser user={data.user} />
      {list.length === 0 ? (
        <Empty description={formatMessage({ id: 'OidcNoTenant' })} />
      ) : (
        <Spin spinning={loading}>
          <div className={style['tenant-list']} role="listbox" aria-label={formatMessage({ id: 'OidcSelectTenant' })}>
            {list.map(item => {
              const name = item.companyName || item.name || item.tenantId;
              const isDefault = item.tenantId === defaultTenantId;
              return (
                <div
                  key={item.tenantId}
                  role="option"
                  aria-selected={selecting === item.tenantId}
                  className={classnames(style['tenant-card'], { [style['tenant-card-active']]: selecting === item.tenantId })}
                  onClick={async () => {
                    if (loading) {
                      return;
                    }
                    setSelecting(item.tenantId);
                    const result = await submit(apis.tenant, { tenantId: item.tenantId });
                    if (!result) {
                      setSelecting(null);
                    }
                  }}
                >
                  {item.logo ? (
                    <Image.Avatar id={item.logo} size={40} />
                  ) : (
                    <span className={style['tenant-avatar']} aria-hidden>
                      {String(name).charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className={style['tenant-name']}>{name}</span>
                  {isDefault && (
                    <Tag bordered={false} color="processing">
                      {formatMessage({ id: 'OidcCurrentTenant' })}
                    </Tag>
                  )}
                  {selecting === item.tenantId && <CheckOutlined className={style['tenant-check']} />}
                </div>
              );
            })}
          </div>
        </Spin>
      )}
    </Flex>
  );
});

const ConsentStep = ({ data, apis, submit, loading }) => {
  const { formatMessage } = useIntl();
  const clientName = data.client?.clientName || data.params?.clientId;
  const scopes = String(data.params?.scope || '')
    .split(' ')
    .filter(Boolean);
  return (
    <Flex vertical gap={24}>
      <div>
        <Typography.Title level={4}>{formatMessage({ id: 'OidcConsentTitle' })}</Typography.Title>
        <Typography.Text type="secondary">{formatMessage({ id: 'OidcConsentDesc' }, { clientName })}</Typography.Text>
      </div>
      <CurrentUser user={data.user} />
      <div>
        <Typography.Text strong>{formatMessage({ id: 'OidcScopes' })}</Typography.Text>
        <Flex wrap gap={8} className={style['scope-list']}>
          {scopes.map(scope => (
            <Tag key={scope}>{scope}</Tag>
          ))}
        </Flex>
      </div>
      <Flex gap={12}>
        <Button type="primary" size="large" block loading={loading} onClick={() => submit(apis.confirm)}>
          {formatMessage({ id: 'OidcConsentAllow' })}
        </Button>
        <Button size="large" block disabled={loading} onClick={() => submit(apis.abort)}>
          {formatMessage({ id: 'OidcConsentDeny' })}
        </Button>
      </Flex>
    </Flex>
  );
};

const InteractionInner = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(({ remoteModules, uid, data, accountType, registerUrl, forgetUrl, loginTitle }) => {
  const [usePreset] = remoteModules;
  const { ajax, apis: presetApis, oidc } = usePreset();
  const { formatMessage } = useIntl();
  const apis = presetApis.oidc.interaction;
  const { loading, submit } = useInteractionSubmit({ ajax, uid });
  const stepProps = { data, apis, submit, loading };
  const promptName = data.prompt?.name;
  // 本系统自己登录：不提示「登录到 xx」，也不提供取消（取消只对其它 client / 子项目跳转过来有意义）
  const isSelfClient = !!data.client?.clientId && data.client.clientId === oidc?.config?.clientId;

  const content = (() => {
    if (promptName === 'login') {
      return (
        <LoginStep
          {...stepProps}
          accountType={accountType}
          registerUrl={registerUrl}
          forgetUrl={forgetUrl}
          title={loginTitle}
          isSelfClient={isSelfClient}
        />
      );
    }
    if (promptName === 'tenant') {
      return <TenantStep {...stepProps} />;
    }
    if (promptName === 'consent') {
      return <ConsentStep {...stepProps} />;
    }
    return <Result status="warning" title={formatMessage({ id: 'OidcUnknownPrompt' }, { name: promptName })} />;
  })();

  return (
    <Flex vertical gap={16} className={style['interaction']}>
      {content}
      {promptName !== 'consent' && !isSelfClient && (
        <Button type="link" className={style['abort-button']} disabled={loading} onClick={() => submit(apis.abort)}>
          {formatMessage({ id: 'OidcCancelLogin' })}
        </Button>
      )}
    </Flex>
  );
});

const Interaction = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(
    ({
      remoteModules,
      uid: uidProp,
      systemName,
      systemLogo,
      loginLeftInner = defaultLeftInner,
      accountType = 'email',
      registerUrl,
      forgetUrl,
      loginTitle,
      allowLanguageSwitch = true
    }) => {
      const [usePreset] = remoteModules;
      const { apis, oidc } = usePreset();
      const { formatMessage } = useIntl();
      const [searchParams] = useSearchParams();
      const uid = uidProp || searchParams.get('uid');
      // 会话已失效时无法得知发起登录的 client：有本系统 oidc 客户端就重新发起登录，否则回首页由应用自行拉起登录
      const renderExpired = title => (
        <ResultPanel
          icon={<ExpiredIcon />}
          title={title}
          description={formatMessage({ id: 'OidcInvalidInteractionDesc' })}
          actionText={formatMessage({ id: 'OidcBackToLogin' })}
          onAction={() => (oidc?.login ? oidc.login({ returnTo: '/' }) : window.location.assign(withPublicUrl('/')))}
        />
      );

      return (
        <Layout>
          <LoginOuterContainer title={systemName} logo={systemLogo} leftInner={loginLeftInner}>
            {uid ? (
              <Fetch
                {...Object.assign({}, apis.oidc.interaction.details)}
                urlParams={{ uid }}
                error={() => renderExpired(formatMessage({ id: 'OidcInvalidInteraction' }))}
                render={({ data }) => (
                  <InteractionInner
                    uid={uid}
                    data={data}
                    accountType={accountType}
                    registerUrl={registerUrl}
                    forgetUrl={forgetUrl}
                    loginTitle={loginTitle}
                  />
                )}
              />
            ) : (
              renderExpired(formatMessage({ id: 'OidcMissingUid' }))
            )}
            {allowLanguageSwitch && <Language colorful={false} className={style['language']} />}
          </LoginOuterContainer>
        </Layout>
      );
    }
  )
);

export default Interaction;
