import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App, Tag, Typography, Empty, Spin } from 'antd';
import { CheckOutlined, RightOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import Fetch from '@kne/react-fetch';
import { useState } from 'react';
import classnames from 'classnames';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';

const tenantInitial = name => {
  const text = String(name || '').trim();
  return text ? text.charAt(0).toUpperCase() : '?';
};

const getTenantDisplay = item => {
  const tenant = item?.tenant || {};
  const company = tenant.tenantCompany || {};

  return {
    logo: company.logo || tenant.logo,
    companyName: company.name || tenant.name || '',
    userName: item?.name || '',
    orgName: item?.tenantOrg?.name || ''
  };
};

const SelectTenant = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Image']
})(({ remoteModules, tenantPath }) => {
  const [usePreset, Image] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  const [switchingId, setSwitchingId] = useState(null);

  return (
    <div className={style.page}>
      <div className={style.shell}>
        <header className={style.header}>
          <Typography.Title level={4} className={style.headerTitle}>
            {formatMessage({ id: 'SelectLoginTenant' })}
          </Typography.Title>
          <Typography.Paragraph className={style.headerSubtitle}>
            {formatMessage({ id: 'SelectLoginTenantSubtitle' })}
          </Typography.Paragraph>
        </header>

        <Fetch
          {...Object.assign({}, apis.tenant.availableList)}
          render={({ data, reload }) => {
            const list = data?.list || [];
            const defaultTenantId = data?.defaultTenantId;
            const currentTenantUser = list.find(item => item.tenantId === defaultTenantId);
            const canEnter = currentTenantUser && currentTenantUser.status === 'open';

            return (
              <>
                <main className={style.main}>
                  {list.length === 0 ? (
                    <Empty className={style.empty} description={formatMessage({ id: 'NoAvailableTenant' })} />
                  ) : (
                    <Spin spinning={!!switchingId}>
                      <div className={style.tenantList} role="listbox" aria-label={formatMessage({ id: 'SelectLoginTenant' })}>
                        {list.map(item => {
                          const display = getTenantDisplay(item);
                          const isSelected = item.tenantId === defaultTenantId;
                          const isDisabled = item.status !== 'open';

                          return (
                            <div
                              key={item.id}
                              role="option"
                              aria-selected={isSelected}
                              aria-disabled={isDisabled}
                              className={classnames(style.tenantCard, {
                                [style.tenantCardSelected]: isSelected,
                                [style.tenantCardDisabled]: isDisabled
                              })}
                              onClick={async () => {
                                if (isSelected || isDisabled || switchingId) {
                                  return;
                                }
                                setSwitchingId(item.tenantId);
                                const { data: resData } = await ajax(
                                  Object.assign({}, apis.tenant.switchDefaultTenant, {
                                    data: { tenantId: item.tenantId }
                                  })
                                );
                                setSwitchingId(null);
                                if (resData.code !== 0) {
                                  return;
                                }
                                message.success(formatMessage({ id: 'SwitchDefaultTenantSuccess' }));
                                reload();
                              }}>
                              {isSelected ? (
                                <span className={style.cardSelectedMark} aria-hidden>
                                  <CheckOutlined />
                                </span>
                              ) : null}

                              <div className={style.cardAvatarWrap}>
                                {display.logo ? (
                                  <span className={style.cardAvatar}>
                                    <Image.Avatar id={display.logo} size={52} />
                                  </span>
                                ) : (
                                  <span className={style.cardAvatarFallback} aria-hidden>
                                    {tenantInitial(display.companyName)}
                                  </span>
                                )}
                              </div>

                              <div className={style.cardBody}>
                                <div className={style.cardTitleRow}>
                                  <span className={style.cardCompany}>{display.companyName}</span>
                                  {isDisabled ? (
                                    <Tag bordered={false} className={style.cardTagMuted}>
                                      {formatMessage({ id: 'TenantUserCannotUse' })}
                                    </Tag>
                                  ) : isSelected ? (
                                    <Tag bordered={false} color="processing" className={style.cardTag}>
                                      {formatMessage({ id: 'CurrentTenant' })}
                                    </Tag>
                                  ) : null}
                                </div>
                                {(display.userName || display.orgName) && (
                                  <div className={style.cardMeta}>
                                    {display.userName ? (
                                      <span className={style.cardMetaItem}>
                                        <UserOutlined className={style.cardMetaIcon} />
                                        <span>{display.userName}</span>
                                      </span>
                                    ) : null}
                                    {display.userName && display.orgName ? (
                                      <span className={style.cardMetaDivider} aria-hidden>
                                        ·
                                      </span>
                                    ) : null}
                                    {display.orgName ? (
                                      <span className={style.cardMetaItem}>
                                        <TeamOutlined className={style.cardMetaIcon} />
                                        <span>{display.orgName}</span>
                                      </span>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Spin>
                  )}
                </main>

                {list.length > 0 ? (
                  <footer className={style.footer}>
                    <Button
                      type="primary"
                      size="large"
                      block
                      disabled={!canEnter}
                      icon={<RightOutlined />}
                      iconPosition="end"
                      onClick={() => {
                        window.location.href = tenantPath;
                      }}>
                      {formatMessage({ id: 'EnterTenant' })}
                    </Button>
                  </footer>
                ) : null}
              </>
            );
          }}
        />
      </div>
    </div>
  );
});

export default withLocale(SelectTenant);
