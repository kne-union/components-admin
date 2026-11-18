import { createWithRemoteLoader } from '@kne/remote-loader';
import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Avatar, Button, Empty, Input, Space, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { useIsMobile } from '@kne/responsive-utils';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import Menu from '../Menu';
import style from './style.module.scss';

const { Text, Title } = Typography;
const PAGE_SIZE = 20;

const getUserName = user => user.nickname || user.name || user.email || user.phone || String(user.id);

const formatDateTime = value => (value ? new Date(value).toLocaleString() : '-');

const formatRelative = (value, locale) => {
  const diffSec = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale || 'zh-CN', { numeric: 'auto' });
  if (abs < 3600) {
    return rtf.format(Math.round(diffSec / 60), 'minute');
  }
  if (abs < 86400) {
    return rtf.format(Math.round(diffSec / 3600), 'hour');
  }
  return rtf.format(Math.round(diffSec / 86400), 'day');
};

const RevokeUserButton = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, userId, logout, confirmMessage, onSuccess, formatMessage, ...props }) => {
  const [ConfirmButton, usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  return (
    <ConfirmButton
      {...props}
      message={confirmMessage}
      onClick={async () => {
        const { data: resData } = await ajax(Object.assign({}, apis.oidc.session.revokeUser, { data: { userId: String(userId), logout } }));
        message.success(formatMessage({ id: 'RevokeUserSuccess' }, { grants: resData.data?.grants ?? 0, sessions: resData.data?.sessions ?? 0 }));
        onSuccess && onSuccess();
      }}
    />
  );
});

const RevokeSessionButton = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, uid, onSuccess }) => {
    const [ConfirmButton, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <ConfirmButton
        danger
        size="small"
        message={formatMessage({ id: 'RevokeSessionConfirm' })}
        onClick={async () => {
          await ajax(Object.assign({}, apis.oidc.session.revoke, { data: { uid } }));
          message.success(formatMessage({ id: 'SessionRevoked' }));
          onSuccess && onSuccess();
        }}>
        {formatMessage({ id: 'RevokeSession' })}
      </ConfirmButton>
    );
  })
);

/** 左栏：搜索 + 滚动到底自动加载下一页 */
const UserList = ({ ajax, api, activeId, onSelect, onLoad, formatMessage }) => {
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState({ list: [], page: 0, total: 0, loading: false });
  const loadingRef = useRef(false);

  const load = useCallback(
    async (page, searchText) => {
      loadingRef.current = true;
      setState(prev => Object.assign({}, prev, { loading: true }));
      const { data: resData } = await ajax(
        Object.assign({}, api, {
          params: { currentPage: page, perPage: PAGE_SIZE, filter: searchText ? { keyword: searchText } : {} }
        })
      );
      const pageData = resData.data?.pageData || [];
      onLoad && onLoad(pageData);
      setState(prev => ({
        list: page === 1 ? pageData : prev.list.concat(pageData),
        page,
        total: resData.data?.totalCount ?? pageData.length,
        loading: false
      }));
      loadingRef.current = false;
    },
    [ajax, api, onLoad]
  );

  useEffect(() => {
    const timer = setTimeout(() => load(1, keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword, load]);

  const hasMore = state.list.length < state.total;

  return (
    <div className={style['user-panel']}>
      <div className={style['user-search']}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={formatMessage({ id: 'SelectUserPlaceholder' })}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>
      <div
        className={style['user-list']}
        onScroll={e => {
          const el = e.currentTarget;
          if (hasMore && !loadingRef.current && el.scrollHeight - el.scrollTop - el.clientHeight < 48) {
            load(state.page + 1, keyword.trim());
          }
        }}>
        {state.list.map(user => (
          <button
            type="button"
            key={user.id}
            className={classnames(style['user-item'], { [style['is-active']]: String(user.id) === String(activeId) })}
            onClick={() => onSelect(user)}>
            <Avatar src={user.avatar} size={36}>
              {getUserName(user).slice(0, 1)}
            </Avatar>
            <span className={style['user-item-text']}>
              <span className={style['user-item-name']}>{getUserName(user)}</span>
              <span className={style['user-item-sub']}>{user.email || user.phone || '-'}</span>
            </span>
          </button>
        ))}
        {state.loading ? (
          <div className={style['user-list-footer']}>
            <Spin size="small" />
          </div>
        ) : null}
        {!state.loading && !state.list.length ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'NoUserFound' })} /> : null}
      </div>
    </div>
  );
};

/** 右栏：用户信息 + 会话卡片 */
const UserSessions = ({ ajax, api, user, onBack, formatMessage, locale }) => {
  const [sessions, setSessions] = useState({ list: [], loading: true });

  const reload = useCallback(async () => {
    setSessions(prev => Object.assign({}, prev, { loading: true }));
    const { data: resData } = await ajax(Object.assign({}, api, { params: { userId: String(user.id) } }));
    setSessions({ list: resData.data || [], loading: false });
  }, [ajax, api, user.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className={style['detail']}>
      {onBack ? (
        <Button type="text" icon={<ArrowLeftOutlined />} className={style['back']} onClick={onBack}>
          {formatMessage({ id: 'BackToUsers' })}
        </Button>
      ) : null}

      <div className={style['profile']}>
        <Avatar src={user.avatar} size={56}>
          {getUserName(user).slice(0, 1)}
        </Avatar>
        <div className={style['profile-text']}>
          <Space size={8} wrap>
            <Title level={5} className={style['profile-name']}>
              {getUserName(user)}
            </Title>
            {user.isSuperAdmin ? <Tag color="gold">{formatMessage({ id: 'SuperAdmin' })}</Tag> : null}
          </Space>
          <Text type="secondary" className={style['profile-sub']}>
            {[user.email, user.phone].filter(Boolean).join(' · ') || '-'}
          </Text>
        </div>
        <Space size={8} wrap className={style['profile-actions']}>
          <RevokeUserButton
            userId={user.id}
            logout={false}
            formatMessage={formatMessage}
            confirmMessage={formatMessage({ id: 'RevokeTokensConfirm' })}
            onSuccess={reload}>
            {formatMessage({ id: 'RevokeTokens' })}
          </RevokeUserButton>
          <RevokeUserButton
            danger
            type="primary"
            userId={user.id}
            logout
            formatMessage={formatMessage}
            confirmMessage={formatMessage({ id: 'ForceLogoutConfirm' })}
            onSuccess={reload}>
            {formatMessage({ id: 'ForceLogout' })}
          </RevokeUserButton>
        </Space>
      </div>

      <div className={style['section-head']}>
        <span className={style['section-title']}>{formatMessage({ id: 'ActiveSessions' })}</span>
        <span className={style['section-count']}>{sessions.list.length}</span>
      </div>

      {sessions.loading ? (
        <div className={style['detail-loading']}>
          <Spin />
        </div>
      ) : sessions.list.length ? (
        <div className={style['session-list']}>
          {sessions.list.map(session => (
            <div key={session.uid} className={style['session-card']}>
              <div className={style['session-card-head']}>
                <div className={style['session-clients']}>
                  {(session.clients || []).map(client => (
                    <Tag key={`${client.clientId}-${client.sid}`} color="blue">
                      {client.clientId}
                    </Tag>
                  ))}
                </div>
                <RevokeSessionButton uid={session.uid} onSuccess={reload} />
              </div>
              <div className={style['session-meta']}>
                <div className={style['meta-item']}>
                  <span className={style['meta-label']}>{formatMessage({ id: 'LoginAt' })}</span>
                  <span className={style['meta-value']}>{formatDateTime(session.loginAt)}</span>
                  <span className={style['meta-sub']}>{formatRelative(session.loginAt, locale)}</span>
                </div>
                <div className={style['meta-item']}>
                  <span className={style['meta-label']}>{formatMessage({ id: 'ExpiresAt' })}</span>
                  <span className={style['meta-value']}>{formatDateTime(session.expiresAt)}</span>
                  <span className={style['meta-sub']}>{formatRelative(session.expiresAt, locale)}</span>
                </div>
              </div>
              <Text className={style['session-uid']} copyable={{ text: session.uid }}>
                {formatMessage({ id: 'SessionUid' })}：{session.uid}
              </Text>
            </div>
          ))}
        </div>
      ) : (
        <div className={style['detail-empty']}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'NoActiveSession' })} />
        </div>
      )}
    </div>
  );
};

const SessionManager = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@Page']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {}, defaultUserId }) => {
    const [usePreset, Page] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage, locale } = useIntl();
    const isMobile = useIsMobile();
    const [user, setUser] = useState(() => (defaultUserId ? { id: defaultUserId, nickname: String(defaultUserId), placeholder: true } : null));
    const handleListLoad = useCallback(list => {
      setUser(prev => (prev?.placeholder ? list.find(item => String(item.id) === String(prev.id)) || prev : prev));
    }, []);

    const listNode = (
      <UserList ajax={ajax} api={apis.admin.getUserList} activeId={user?.id} onSelect={setUser} onLoad={handleListLoad} formatMessage={formatMessage} />
    );
    const detailNode = user ? (
      <UserSessions
        key={user.id}
        ajax={ajax}
        api={apis.oidc.session.list}
        user={user}
        onBack={isMobile ? () => setUser(null) : null}
        formatMessage={formatMessage}
        locale={locale}
      />
    ) : (
      <div className={style['detail-placeholder']}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'SelectUserFirst' })} />
      </div>
    );

    return (
      <Page {...pageProps} title={formatMessage({ id: 'SessionManager' })} menu={pageProps.menu || <Menu baseUrl={baseUrl} />}>
        {isMobile ? (
          <div className={style['mobile']}>{user ? detailNode : listNode}</div>
        ) : (
          <div className={style['split']}>
            <aside className={style['split-left']}>{listNode}</aside>
            <section className={style['split-right']}>{detailNode}</section>
          </div>
        )}
      </Page>
    );
  })
);

export default SessionManager;
