import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App, Tag, Typography, Empty, Spin } from 'antd';
import { CheckOutlined, RightOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import Fetch from '@kne/react-fetch';
import { useState } from 'react';
import classnames from 'classnames';
import withLocale from '../withLocale';
import { withPublicUrl } from '../../../utils/publicUrl';
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

const isSameTenant = (a, b) => a != null && b != null && String(a) === String(b);

/** 嵌入宿主 Page（如 @kne/system-layout）时使用：样式与 Oidc 交互页的选择租户一致，点击租户直接进入 */
const EmbeddedSelectTenant = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Image']
})(({ remoteModules, tenantPath }) => {
  const [usePreset, Image] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, ajax, oidc } = usePreset();
  const [switchingId, setSwitchingId] = useState(null);

  return (
    <Fetch
      {...Object.assign({}, apis.tenant.availableList)}
      render={({ data }) => {
        const list = data?.list || [];
        const tokenTenantId = oidc?.getTenantId?.();
        const currentTenantId = (oidc && tokenTenantId) || data?.defaultTenantId;

        const enter = async item => {
          if (item.status !== 'open' || switchingId) {
            return;
          }
          // OIDC 下当前租户由令牌决定，换租户需重新签发令牌
          if (isSameTenant(item.tenantId, oidc ? tokenTenantId : data?.defaultTenantId)) {
            window.location.href = withPublicUrl(tenantPath);
            return;
          }
          setSwitchingId(item.tenantId);
          if (oidc) {
            oidc.switchTenant(item.tenantId, { returnTo: withPublicUrl(tenantPath) });
            return;
          }
          const { data: resData } = await ajax(Object.assign({}, apis.tenant.switchDefaultTenant, { data: { tenantId: item.tenantId } }));
          if (resData.code !== 0) {
            setSwitchingId(null);
            return;
          }
          window.location.href = withPublicUrl(tenantPath);
        };

        return (
          <div className={style.embedded}>
            <div className={style.embeddedHeader}>
              <Typography.Title level={4} className={style.embeddedTitle}>
                {formatMessage({ id: 'SelectLoginTenant' })}
              </Typography.Title>
              <Typography.Text type="secondary">{formatMessage({ id: 'SelectLoginTenantEmbeddedSubtitle' })}</Typography.Text>
            </div>
            {list.length === 0 ? (
              <Empty className={style.empty} description={formatMessage({ id: 'NoAvailableTenant' })} />
            ) : (
              <Spin spinning={!!switchingId}>
                <div className={style.embeddedList} role="listbox" aria-label={formatMessage({ id: 'SelectLoginTenant' })}>
                  {list.map(item => {
                    const display = getTenantDisplay(item);
                    const isCurrent = isSameTenant(item.tenantId, currentTenantId);
                    const isDisabled = item.status !== 'open';
                    const meta = [display.userName, display.orgName].filter(Boolean).join(' · ');
                    return (
                      <div
                        key={item.id}
                        role="option"
                        aria-selected={isSameTenant(item.tenantId, switchingId)}
                        aria-disabled={isDisabled}
                        className={classnames(style.embeddedCard, {
                          [style.embeddedCardActive]: isSameTenant(item.tenantId, switchingId),
                          [style.embeddedCardDisabled]: isDisabled
                        })}
                        onClick={() => enter(item)}>
                        {display.logo ? (
                          <Image.Avatar id={display.logo} size={40} className={style.embeddedAvatarImage} />
                        ) : (
                          <span className={style.embeddedAvatar} aria-hidden>
                            {tenantInitial(display.companyName)}
                          </span>
                        )}
                        <div className={style.embeddedBody}>
                          <div className={style.embeddedName}>{display.companyName}</div>
                          {meta && <div className={style.embeddedMeta}>{meta}</div>}
                        </div>
                        {isDisabled ? (
                          <Tag bordered={false} className={style.cardTagMuted}>
                            {formatMessage({ id: 'TenantUserCannotUse' })}
                          </Tag>
                        ) : isCurrent ? (
                          <Tag bordered={false} color="processing" className={style.cardTag}>
                            {formatMessage({ id: 'CurrentTenant' })}
                          </Tag>
                        ) : null}
                        {isSameTenant(item.tenantId, switchingId) ? <CheckOutlined className={style.embeddedCheck} /> : <RightOutlined className={style.embeddedArrow} />}
                      </div>
                    );
                  })}
                </div>
              </Spin>
            )}
          </div>
        );
      }}
    />
  );
});

const SelectTenant = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Image']
})(({ remoteModules, tenantPath }) => {
  const [usePreset, Image] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, ajax, oidc } = usePreset();
  const { message } = App.useApp();
  const [switchingId, setSwitchingId] = useState(null);
  // OIDC 下当前租户由令牌决定，切换需重新签发令牌：点卡片只选中，进入时再切换
  const [pickedId, setPickedId] = useState(null);

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
            const tokenTenantId = oidc?.getTenantId?.();
            const currentTenantId = (oidc && tokenTenantId) || data?.defaultTenantId;
            const selectedTenantId = (oidc && pickedId) || currentTenantId;
            const selectedTenantUser = list.find(item => isSameTenant(item.tenantId, selectedTenantId));
            const canEnter = selectedTenantUser && selectedTenantUser.status === 'open';

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
                          const isSelected = isSameTenant(item.tenantId, selectedTenantId);
                          const isCurrent = isSameTenant(item.tenantId, currentTenantId);
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
                                if (oidc) {
                                  setPickedId(item.tenantId);
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
                                  ) : isCurrent ? (
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
                      loading={!!switchingId}
                      icon={<RightOutlined />}
                      iconPosition="end"
                      onClick={() => {
                        if (oidc && !isSameTenant(selectedTenantId, tokenTenantId)) {
                          setSwitchingId(selectedTenantId);
                          oidc.switchTenant(selectedTenantId, { returnTo: withPublicUrl(tenantPath) });
                          return;
                        }
                        window.location.href = withPublicUrl(tenantPath);
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

export default withLocale(({ embedded, ...props }) => (embedded ? <EmbeddedSelectTenant {...props} /> : <SelectTenant {...props} />));
